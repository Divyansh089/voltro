import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  console.log('🌱 Starting database seed...');

  // ── 1. Create Roles ──────────────────────────────────────────
  console.log('Creating roles...');
  
  const roles = [
    { name: 'ADMIN', description: 'System administrator with full access to everything.', isSystem: true },
    { name: 'PRODUCT_MANAGER', description: 'Store manager with access to catalog, inventory, and analytics.', isSystem: true },
    { name: 'CUSTOMER_SUPPORT', description: 'Customer support representative.', isSystem: true },
    { name: 'CUSTOMER', description: 'Standard customer account.', isSystem: true },
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
    { resource: 'product', action: 'create', name: 'product:create', description: 'Create new products' },
    { resource: 'product', action: 'read', name: 'product:read', description: 'Read products' },
    { resource: 'product', action: 'update', name: 'product:update', description: 'Update products' },
    { resource: 'product', action: 'delete', name: 'product:delete', description: 'Delete products' },
    { resource: 'user', action: 'read', name: 'user:read', description: 'Read users' },
    { resource: 'user', action: 'update', name: 'user:update', description: 'Update users' },
    { resource: 'user', action: 'delete', name: 'user:delete', description: 'Delete users' },
    { resource: 'inventory', action: 'read', name: 'inventory:read', description: 'Read inventory levels' },
    { resource: 'inventory', action: 'update', name: 'inventory:update', description: 'Update inventory levels' },
    { resource: 'order', action: 'read', name: 'order:read', description: 'Read all orders' },
    { resource: 'order', action: 'update', name: 'order:update', description: 'Update order status' },
    { resource: 'customer', action: 'read', name: 'customer:read', description: 'Read customer details' },
    { resource: 'ticket', action: 'read', name: 'ticket:read', description: 'Read support tickets' },
    { resource: 'ticket', action: 'reply', name: 'ticket:reply', description: 'Reply to support tickets' },
    { resource: 'cms', action: 'manage', name: 'cms:manage', description: 'Manage banners and campaigns' },
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
  
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const productManagerRole = await prisma.role.findUnique({ where: { name: 'PRODUCT_MANAGER' } });
  const supportRole = await prisma.role.findUnique({ where: { name: 'CUSTOMER_SUPPORT' } });
  const customerRole = await prisma.role.findUnique({ where: { name: 'CUSTOMER' } });

  const allPerms = await prisma.permission.findMany();

  if (adminRole) {
    for (const p of allPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: adminRole.id, permissionId: p.id },
      });
    }
  }

  if (productManagerRole) {
    const managerPerms = allPerms.filter((p: any) => ['product', 'inventory', 'order', 'cms', 'analytics'].includes(p.resource));
    for (const p of managerPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: productManagerRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: productManagerRole.id, permissionId: p.id },
      });
    }
  }

  if (supportRole) {
    const supportPerms = allPerms.filter((p : any) => p.resource === 'ticket' || (p.resource === 'order' && p.action === 'read') || (p.resource === 'customer' && p.action === 'read'));
    for (const p of supportPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: supportRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: supportRole.id, permissionId: p.id },
      });
    }
  }
  console.log('✅ Role permissions assigned');

  // ── 4. Create Initial Users (Admin, PM, Customers) ──
  console.log('Creating initial users...');
  
  if (adminRole) {
    const passwordHash = await bcrypt.hash('admin123', SALT_ROUNDS);
    await prisma.user.upsert({
      where: { id: 'admin_user' },
      update: {},
      create: {
        id: 'admin_user',
        email: 'admin@voltra.com',
        passwordHash,
        roleId: adminRole.id,
        isEmailVerified: true,
        staffProfile: {
          create: { roleId: adminRole.id, firstName: 'Super', lastName: 'Admin', phone: '0000000000' }
        }
      },
    });
    console.log(`✅ Admin created (id: admin_user)`);
  }

  if (productManagerRole) {
    const passwordHash = await bcrypt.hash('staff123', SALT_ROUNDS);
    await prisma.user.upsert({
      where: { id: 'staff_user' },
      update: {},
      create: {
        id: 'staff_user',
        email: 'staff@voltra.com',
        passwordHash,
        roleId: productManagerRole.id,
        isEmailVerified: true,
        staffProfile: {
          create: { roleId: productManagerRole.id, firstName: 'Product', lastName: 'Manager', phone: '1111111111' }
        }
      },
    });
    console.log(`✅ Staff created (id: staff_user)`);
  }

  if (customerRole) {
    const passwordHash1 = await bcrypt.hash('customer123', SALT_ROUNDS);
    await prisma.user.upsert({
      where: { id: 'customer_1' },
      update: {},
      create: {
        id: 'customer_1',
        email: 'customer1@voltra.com',
        passwordHash: passwordHash1,
        roleId: customerRole.id,
        isEmailVerified: true,
        customerProfile: {
          create: {
            firstName: 'John',
            lastName: 'Doe',
            phone: '3333333333',
          }
        }
      },
    });
    console.log(`✅ Customer 1 created (id: customer_1)`);

    const passwordHash2 = await bcrypt.hash('customer456', SALT_ROUNDS);
    await prisma.user.upsert({
      where: { id: 'customer_2' },
      update: {},
      create: {
        id: 'customer_2',
        email: 'customer2@voltra.com',
        passwordHash: passwordHash2,
        roleId: customerRole.id,
        isEmailVerified: true,
        customerProfile: {
          create: {
            firstName: 'Jane',
            lastName: 'Smith',
            phone: '4444444444',
          }
        }
      },
    });
    console.log(`✅ Customer 2 created (id: customer_2)`);
  }

  // ── 5. Create 2 Specific Products for the Orders ──
  console.log('Creating specific Products...');
  
  const audioCat = await prisma.category.upsert({
    where: { slug: 'audio' },
    update: {},
    create: { name: 'Audio', slug: 'audio', description: 'Premium Audio', isActive: true }
  });

  const laptopCat = await prisma.category.upsert({
    where: { slug: 'laptop' },
    update: {},
    create: { name: 'Laptop', slug: 'laptop', description: 'Premium Laptops', isActive: true }
  });

  const product1 = await prisma.product.upsert({
    where: { slug: 'audio-pro' },
    update: {},
    create: {
      name: 'Voltra Audio Pro', slug: 'audio-pro', description: 'High fidelity audio.',
      basePrice: 200, categoryId: audioCat.id, brand: 'Voltra', status: 'ACTIVE',
    }
  });

  const variant1 = await prisma.variant.upsert({
    where: { sku: 'audio-pro-blk' },
    update: {},
    create: {
      productId: product1.id, sku: 'audio-pro-blk', name: 'Voltra Audio Pro Black',
      color: 'Black', price: 200, inventory: { create: { quantity: 50 } }
    }
  });

  const product2 = await prisma.product.upsert({
    where: { slug: 'laptop-pro' },
    update: {},
    create: {
      name: 'Voltra Laptop Pro', slug: 'laptop-pro', description: 'Powerful laptop.',
      basePrice: 1000, categoryId: laptopCat.id, brand: 'Voltra', status: 'ACTIVE',
    }
  });

  const variant2 = await prisma.variant.upsert({
    where: { sku: 'laptop-pro-slv' },
    update: {},
    create: {
      productId: product2.id, sku: 'laptop-pro-slv', name: 'Voltra Laptop Pro Silver',
      color: 'Silver', price: 1000, inventory: { create: { quantity: 50 } }
    }
  });

  // ── 6. Create Coupons ──
  console.log('Creating Coupons...');
  
  const coupon30 = await prisma.coupon.upsert({
    where: { code: 'WELCOME30' },
    update: {},
    create: {
      code: 'WELCOME30', description: '30% off your order', discountType: 'PERCENTAGE',
      discountValue: 30, usageLimit: 1000, validFrom: new Date(),
      validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    }
  });

  const coupon50 = await prisma.coupon.upsert({
    where: { code: 'SUMMER50' },
    update: {},
    create: {
      code: 'SUMMER50', description: '50% off your order', discountType: 'PERCENTAGE',
      discountValue: 50, usageLimit: 1000, validFrom: new Date(),
      validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    }
  });

  // ── 7. Generate Orders ──
  console.log('Generating Orders...');

  // Create Addresses
  const address1 = await prisma.address.create({
    data: {
      userId: 'customer_1', label: 'Home', fullName: 'John Doe', phone: '3333333333',
      addressLine1: '123 Main St', city: 'New York', state: 'NY', postalCode: '10001', country: 'US', isDefault: true
    }
  });

  const address2 = await prisma.address.create({
    data: {
      userId: 'customer_2', label: 'Office', fullName: 'Jane Smith', phone: '4444444444',
      addressLine1: '456 Business Rd', city: 'San Francisco', state: 'CA', postalCode: '94107', country: 'US', isDefault: true
    }
  });

  // Order 1 (Customer 1, Product 1, 30% off)
  const order1Total = 200 * 0.7; // 30% off 200 is 140
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-10001',
      userId: 'customer_1',
      status: 'DELIVERED',
      subtotal: 200,
      tax: 0,
      shippingCost: 0,
      discount: 60, // 30% of 200
      total: order1Total,
      shippingAddressId: address1.id,
      couponId: coupon30.id,
      orderItems: {
        create: {
          variantId: variant1.id,
          productName: product1.name,
          variantName: variant1.name,
          quantity: 1,
          unitPrice: 200,
          totalPrice: 200
        }
      },
      payment: {
        create: {
          gateway: 'stripe',
          status: 'COMPLETED',
          amount: order1Total,
          currency: 'USD',
          paidAt: new Date()
        }
      }
    }
  });

  // Order 2 (Customer 2, Product 2, 50% off)
  const order2Total = 1000 * 0.5; // 50% off 1000 is 500
  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-10002',
      userId: 'customer_2',
      status: 'PROCESSING',
      subtotal: 1000,
      tax: 0,
      shippingCost: 0,
      discount: 500, // 50% of 1000
      total: order2Total,
      shippingAddressId: address2.id,
      couponId: coupon50.id,
      orderItems: {
        create: {
          variantId: variant2.id,
          productName: product2.name,
          variantName: variant2.name,
          quantity: 1,
          unitPrice: 1000,
          totalPrice: 1000
        }
      },
      payment: {
        create: {
          gateway: 'stripe',
          status: 'COMPLETED',
          amount: order2Total,
          currency: 'USD',
          paidAt: new Date()
        }
      }
    }
  });

  console.log(`✅ Order ${order1.orderNumber} created for Customer 1`);
  console.log(`✅ Order ${order2.orderNumber} created for Customer 2`);

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
