import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Voltra database seeding...');

  // ── 1. Create 4 System Roles ─────────────────────────────────
  const rolesData = [
    { name: 'ADMIN', description: 'Super Administrator with full system control', isSystem: true },
    { name: 'PRODUCT_MANAGER', description: 'Manages catalog, products, inventory, and CMS banners', isSystem: true },
    { name: 'CUSTOMER_SUPPORT', description: 'Handles customer orders, refunds, and support tickets', isSystem: true },
    { name: 'CUSTOMER', description: 'Registered storefront customer', isSystem: true },
  ];

  const roles: Record<string, string> = {};
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
    roles[r.name] = role.id;
    console.log(`✅ Role seeded: ${r.name}`);
  }

  // ── 2. Create System Permissions ──────────────────────────────
  const permissionsData = [
    // Products
    { name: 'product:create', resource: 'product', action: 'create', description: 'Create products' },
    { name: 'product:read', resource: 'product', action: 'read', description: 'View products' },
    { name: 'product:update', resource: 'product', action: 'update', description: 'Edit products' },
    { name: 'product:delete', resource: 'product', action: 'delete', description: 'Delete products' },
    // Categories
    { name: 'category:create', resource: 'category', action: 'create', description: 'Create categories' },
    { name: 'category:read', resource: 'category', action: 'read', description: 'View categories' },
    { name: 'category:update', resource: 'category', action: 'update', description: 'Edit categories' },
    { name: 'category:delete', resource: 'category', action: 'delete', description: 'Delete categories' },
    // Inventory
    { name: 'inventory:read', resource: 'inventory', action: 'read', description: 'View stock levels' },
    { name: 'inventory:update', resource: 'inventory', action: 'update', description: 'Adjust stock levels' },
    // Orders
    { name: 'order:read', resource: 'order', action: 'read', description: 'View customer orders' },
    { name: 'order:update', resource: 'order', action: 'update', description: 'Update order status' },
    { name: 'order:cancel', resource: 'order', action: 'cancel', description: 'Cancel orders' },
    // Refunds
    { name: 'refund:read', resource: 'refund', action: 'read', description: 'View refund requests' },
    { name: 'refund:update', resource: 'refund', action: 'update', description: 'Approve or reject refunds' },
    // Support
    { name: 'ticket:read', resource: 'ticket', action: 'read', description: 'View support tickets' },
    { name: 'ticket:reply', resource: 'ticket', action: 'reply', description: 'Reply to support tickets' },
    { name: 'ticket:update', resource: 'ticket', action: 'update', description: 'Update ticket status' },
    // Users & Staff
    { name: 'user:create', resource: 'user', action: 'create', description: 'Create staff accounts' },
    { name: 'user:read', resource: 'user', action: 'read', description: 'View users & staff' },
    { name: 'user:update', resource: 'user', action: 'update', description: 'Update user profiles' },
    { name: 'user:delete', resource: 'user', action: 'delete', description: 'Deactivate users' },
    // CMS & Analytics
    { name: 'cms:manage', resource: 'cms', action: 'manage', description: 'Manage homepage banners' },
    { name: 'analytics:read', resource: 'analytics', action: 'read', description: 'View executive analytics' },
  ];

  const permissions: Record<string, string> = {};
  for (const p of permissionsData) {
    const perm = await prisma.permission.upsert({
      where: { name: p.name },
      update: { description: p.description },
      create: p,
    });
    permissions[p.name] = perm.id;
  }
  console.log(`✅ ${Object.keys(permissions).length} Permissions seeded.`);

  // ── 3. Role-Permission Mappings ──────────────────────────────
  const rolePermissionsMap: Record<string, string[]> = {
    ADMIN: Object.keys(permissions),
    PRODUCT_MANAGER: [
      'product:create', 'product:read', 'product:update', 'product:delete',
      'category:create', 'category:read', 'category:update', 'category:delete',
      'inventory:read', 'inventory:update',
      'cms:manage',
    ],
    CUSTOMER_SUPPORT: [
      'order:read', 'order:update', 'order:cancel',
      'refund:read', 'refund:update',
      'ticket:read', 'ticket:reply', 'ticket:update',
      'user:read',
    ],
    CUSTOMER: [],
  };

  for (const [roleName, permNames] of Object.entries(rolePermissionsMap)) {
    const roleId = roles[roleName];
    for (const permName of permNames) {
      const permissionId = permissions[permName];
      if (roleId && permissionId) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId, permissionId } },
          update: {},
          create: { roleId, permissionId },
        });
      }
    }
  }
  console.log('✅ Role permissions mapped.');

  // ── 4. Create 6 Store Categories ─────────────────────────────
  const categoriesData = [
    {
      name: 'Smartphones',
      slug: 'phones',
      description: 'Voltra Flagship & Next-Gen Mobile Devices',
      imageUrl: '/category/phone1.png',
      sortOrder: 1,
    },
    {
      name: 'Laptops',
      slug: 'laptops',
      description: 'Ultra-thin Workstations & High Performance Laptops',
      imageUrl: '/category/laptop01.png',
      sortOrder: 2,
    },
    {
      name: 'Tablets',
      slug: 'tablets',
      description: 'Creative Digital Canvas & Portable Tablets',
      imageUrl: '/category/tab01.png',
      sortOrder: 3,
    },
    {
      name: 'Audio',
      slug: 'audio',
      description: 'Noise-Cancelling Headphones & High-Fidelity Earbuds',
      imageUrl: '/category/audio01.png',
      sortOrder: 4,
    },
    {
      name: 'Drones',
      slug: 'drones',
      description: '4K Aerial Photography & Compact Drones',
      imageUrl: '/category/drone01.png',
      sortOrder: 5,
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'GaN Fast Chargers, Cables & Smart Gadgets',
      imageUrl: '/category/acc01.png',
      sortOrder: 6,
    },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, imageUrl: cat.imageUrl },
      create: cat,
    });
    console.log(`✅ Category seeded: ${cat.name}`);
  }

  // ── 5. Create Initial Super Admin Account ────────────────────
  const adminEmail = 'bytezk089@gmail.com';
  const hashedPassword = await bcrypt.hash('kingDev108', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: hashedPassword,
      isEmailVerified: true,
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      roleId: roles['ADMIN'],
      isEmailVerified: true,
      isActive: true,
      staffProfile: {
        create: {
          roleId: roles['ADMIN'],
          firstName: 'Supreme',
          lastName: 'Leader',
          phone: '+919999456301',
        },
      },
    },
  });
  console.log(`✅ Initial Admin user created: ${adminUser.email}`);

  console.log('\n🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
