import prisma from '../../prisma/prismaClient';
import { NotFoundError, BadRequestError } from '../../common/errors';
import type { Prisma } from '@prisma/client';

// Simple util for ticket numbers
const generateTicketNumber = () => {
  const prefix = 'TCK';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

export class TicketsService {
  /**
   * Find tickets
   */
  static async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    userId?: string;
    status?: string;
    priority?: string;
    assignedToId?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const { page, limit, search, userId, status, priority, assignedToId, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(userId && { userId }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assignedToId && { assignedTo: assignedToId }),
      ...(search && {
        OR: [
          { id: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
          { orderId: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, tickets] = await prisma.$transaction([
      prisma.supportTicket.count({ where }),
      prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: { select: { email: true, customerProfile: { select: { firstName: true, lastName: true } } } },
          _count: { select: { replies: true } },
        },
      }),
    ]);

    return { total, tickets };
  }

  /**
   * Find ticket by ID
   */
  static async findById(id: string, userId?: string, isAdmin = false) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, customerProfile: { select: { firstName: true, lastName: true } } } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { id: true, email: true } } }
        }
      }
    });

    if (!ticket) throw new NotFoundError('Ticket', id);
    if (!isAdmin && ticket.userId !== userId) throw new NotFoundError('Ticket', id); // Restrict access

    return ticket;
  }

  /**
   * Create ticket (Customer)
   */
  static async create(
    userId: string,
    data: { subject: string; category?: string; description?: string; message?: string; priority?: string; orderId?: string },
    ipAddress?: string,
    userAgent?: string
  ) {
    const textMessage = data.message || data.description || 'Support query created';
    const categoryName = data.category || 'General';

    const ticket = await prisma.$transaction(async (tx: any) => {
      
      // Auto-Assignment Logic: Find Support Staff with fewest open tickets
      const supportAgents = await tx.user.findMany({
        where: { role: { name: 'CUSTOMER_SUPPORT' } },
        select: { id: true }
      });

      let assignedTo: string | undefined = undefined;
      
      if (supportAgents.length > 0) {
        const agentIds = supportAgents.map((a: any) => a.id);
        
        const ticketCounts = await tx.supportTicket.groupBy({
          by: ['assignedTo'],
          where: {
            assignedTo: { in: agentIds },
            status: { in: ['OPEN', 'IN_PROGRESS'] }
          },
          _count: { id: true }
        });

        // Map load counts to all eligible agents (handles agents with 0 tickets)
        const agentLoad = agentIds.map((id: string) => {
          const record = ticketCounts.find((t: any) => t.assignedTo === id);
          return { id, count: record ? record._count.id : 0 };
        });

        // Pick the agent with the lowest count
        agentLoad.sort((a: any, b: any) => a.count - b.count);
        assignedTo = agentLoad[0].id;
      }

      const created = await tx.supportTicket.create({
        data: {
          userId,
          category: categoryName,
          subject: data.subject,
          status: 'OPEN',
          priority: data.priority || 'LOW',
          orderId: data.orderId,
          ...(assignedTo && { assignedTo }),
          replies: {
            create: {
              userId,
              message: textMessage,
            }
          }
        }
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'TICKET_CREATED',
          resource: 'support_ticket',
          resourceId: created.id,
          ipAddress,
          userAgent,
        }
      });

      return created;
    });

    // Notify Customer & Support Staff
    try {
      const { NotificationsService } = await import('../notifications/notifications.service');
      await NotificationsService.create({
        userId,
        type: 'GENERAL',
        title: 'Customer Support Request Opened',
        message: `Your ticket '${ticket.subject}' has been submitted. Our team will reply shortly.`,
        data: { ticketId: ticket.id, kind: 'CS_TICKET_OPENED' },
      });

      await NotificationsService.broadcastToRoles(['ADMIN', 'CUSTOMER_SUPPORT'], {
        type: 'GENERAL',
        title: 'New Customer Ticket Opened',
        message: `Customer (ID: ${userId}) created support ticket '${ticket.subject}' (Ticket ID: ${ticket.id})`,
        data: { customerId: userId, ticketId: ticket.id, kind: 'CS_TICKET_OPENED' },
      });
    } catch (e) {
      // ignore
    }

    return ticket;
  }

  /**
   * Add message to ticket
   */
  static async addMessage(ticketId: string, senderId: string, message: string, isAdmin = false) {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundError('Ticket', ticketId);
    
    if (!isAdmin && ticket.userId !== senderId) {
      throw new BadRequestError('Not authorized to add message to this ticket');
    }

    if (ticket.status === 'CLOSED') {
      throw new BadRequestError('Cannot add message to a closed ticket');
    }

    const newMessage = await prisma.$transaction(async (tx: any) => {
      const created = await tx.supportReply.create({
        data: {
          ticketId,
          userId: senderId,
          message,
          isStaffReply: isAdmin,
        }
      });

      // When customer support staff replies to the chat, automatically transition status from OPEN to IN_PROGRESS
      let newStatus = ticket.status;
      if (isAdmin && ticket.status === 'OPEN') {
        newStatus = 'IN_PROGRESS';
      }

      await tx.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: newStatus,
          updatedAt: new Date()
        }
      });

      return created;
    });

    // If staff replied, notify Customer
    if (isAdmin) {
      try {
        const { NotificationsService } = await import('../notifications/notifications.service');
        await NotificationsService.create({
          userId: ticket.userId,
          type: 'GENERAL',
          title: 'Customer Support Reply',
          message: `Customer Support staff replied to your ticket '${ticket.subject}'.`,
          data: { ticketId: ticket.id, kind: 'CS_TICKET_REPLIED' },
        });
      } catch (e) {
        // ignore
      }
    }

    return newMessage;
  }

  /**
   * Update ticket status/priority (Admin)
   */
  static async updateTicket(id: string, data: any, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundError('Ticket', id);

    const { assignedToId, ...restData } = data;
    const updateData = {
      ...restData,
      ...(assignedToId !== undefined && { assignedTo: assignedToId })
    };

    const updated = await prisma.$transaction(async (tx: any) => {
      const result = await tx.supportTicket.update({
        where: { id },
        data: updateData,
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'TICKET_UPDATED',
          resource: 'support_ticket',
          resourceId: id,
          oldValues: { status: ticket.status, priority: ticket.priority, assignedTo: ticket.assignedTo },
          newValues: updateData as any,
          ipAddress,
          userAgent,
        }
      });

      return result;
    });

    return updated;
  }
}
