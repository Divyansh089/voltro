import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  console.log('🌱 Starting database seed...');

  // ── 1. Create Roles ──────────────────────────────────────────
  console.log('Creating roles...');
  
  const roles = [
    {
      name: 'SUPER_ADMIN',
      description: 'System administrator with full access to everything.',
      isSystem: true,
    },
    {
      name: 'ADMIN',
      description: 'Administrator with broad access but restricted from system settings.',
      isSystem: true,
    },
    {
      name: 'MANAGER',
      description: 'Store manager with access to catalog, orders, and staff.',
      isSystem: true,
    },
    {
      name: 'SUPPORT_AGENT',
      description: 'Customer support representative.',
      isSystem: true,
    },
    {
      name: 'WAREHOUSE',
      description: 'Warehouse staff for inventory management and order fulfillment.',
      isSystem: true,
    },
    {
      name: 'CUSTOMER',
      description: 'Standard customer account.',
      isSystem: true,
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log('✅ Roles created');

  // ── 2. Create Permissions ────────────────────────────────────
  console.log('Creating permissions...');
  
  const permissions = [
    // Products
    { resource: 'product', action: 'create', name: 'product:create', description: 'Create new products' },
    { resource: 'product', action: 'read', name: 'product:read', description: 'Read products' },
    { resource: 'product', action: 'update', name: 'product:update', description: 'Update products' },
    { resource: 'product', action: 'delete', name: 'product:delete', description: 'Delete products' },
    
    // Inventory
    { resource: 'inventory', action: 'read', name: 'inventory:read', description: 'Read inventory levels' },
    { resource: 'inventory', action: 'update', name: 'inventory:update', description: 'Update inventory levels' },
    
    // Orders
    { resource: 'order', action: 'read', name: 'order:read', description: 'Read all orders' },
    { resource: 'order', action: 'update', name: 'order:update', description: 'Update order status' },
    
    // Customers
    { resource: 'customer', action: 'read', name: 'customer:read', description: 'Read customer details' },
    
    // Support
    { resource: 'ticket', action: 'read', name: 'ticket:read', description: 'Read support tickets' },
    { resource: 'ticket', action: 'reply', name: 'ticket:reply', description: 'Reply to support tickets' },
    
    // CMS
    { resource: 'cms', action: 'manage', name: 'cms:manage', description: 'Manage banners and campaigns' },
    
    // Analytics
    { resource: 'analytics', action: 'read', name: 'analytics:read', description: 'View business analytics' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }
  console.log('✅ Permissions created');

  // ── 3. Assign Permissions to Roles ─────────────────────────
  console.log('Assigning permissions to roles...');
  
  // Note: SUPER_ADMIN bypasses checks, no need to assign manually.
  
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const managerRole = await prisma.role.findUnique({ where: { name: 'MANAGER' } });
  const supportRole = await prisma.role.findUnique({ where: { name: 'SUPPORT_AGENT' } });
  const warehouseRole = await prisma.role.findUnique({ where: { name: 'WAREHOUSE' } });

  const allPerms = await prisma.permission.findMany();

  // Admin gets everything
  if (adminRole) {
    for (const p of allPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: adminRole.id, permissionId: p.id },
        },
        update: {},
        create: { roleId: adminRole.id, permissionId: p.id },
      });
    }
  }

  // Manager gets catalog, orders, customers, cms, analytics
  if (managerRole) {
    const managerPerms = allPerms.filter((p: any) => 
      ['product', 'inventory', 'order', 'customer', 'cms', 'analytics'].includes(p.resource)
    );
    for (const p of managerPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: managerRole.id, permissionId: p.id },
        },
        update: {},
        create: { roleId: managerRole.id, permissionId: p.id },
      });
    }
  }

  // Support gets tickets, read orders, read customers
  if (supportRole) {
    const supportPerms = allPerms.filter((p : any) => 
      p.resource === 'ticket' || 
      (p.resource === 'order' && p.action === 'read') ||
      (p.resource === 'customer' && p.action === 'read')
    );
    for (const p of supportPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: supportRole.id, permissionId: p.id },
        },
        update: {},
        create: { roleId: supportRole.id, permissionId: p.id },
      });
    }
  }

  // Warehouse gets inventory update, order status update
  if (warehouseRole) {
    const warehousePerms = allPerms.filter((p : any) => 
      p.resource === 'inventory' || 
      (p.resource === 'order' && p.action !== 'delete')
    );
    for (const p of warehousePerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: warehouseRole.id, permissionId: p.id },
        },
        update: {},
        create: { roleId: warehouseRole.id, permissionId: p.id },
      });
    }
  }
  console.log('✅ Role permissions assigned');

  // ── 4. Create Initial Super Admin ──────────────────────────
  console.log('Creating initial SUPER_ADMIN user...');
  
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  
  if (superAdminRole) {
    const adminEmail = 'admin@voltra.com';
    const passwordHash = await bcrypt.hash('VoltraAdmin123!', SALT_ROUNDS);
    
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        passwordHash,
        roleId: superAdminRole.id,
        isEmailVerified: true,
        staffProfile: {
          create: {
            employeeId: 'EMP-0001',
            department: 'Engineering',
            position: 'System Administrator',
          }
        }
      },
    });
    console.log(`✅ Super Admin created (email: ${adminEmail})`);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
