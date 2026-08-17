import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  console.log('🌱 Starting database seed for testing...');

  // ── 0. Clean Existing Test Data ──────────────────────────────
  console.log('Cleaning old test data...');
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.refundRequest.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.address.deleteMany();
  await prisma.variantOptionValue.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.productOptionValue.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.product.deleteMany();
  console.log('✅ Old test data cleaned');

  // ── 1. Create Roles ──────────────────────────────────────────
  console.log('Creating system roles...');
  const roles = [
    { name: 'ADMIN', description: 'System administrator with full access to everything.', isSystem: true },
    { name: 'PRODUCT_MANAGER', description: 'Store manager with access to catalog, inventory, and analytics.', isSystem: true },
    { name: 'CUSTOMER_SUPPORT', description: 'Customer support representative.', isSystem: true },
    { name: 'CUSTOMER', description: 'Standard customer account.', isSystem: true },
  ];
  for (const role of roles) {
    await prisma.role.upsert({ where: { name: role.name }, update: {}, create: role });
  }
  console.log('✅ Roles created');

  // ── 2. Create Permissions ────────────────────────────────────
  console.log('Creating system permissions...');
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
    await prisma.permission.upsert({ where: { name: perm.name }, update: {}, create: perm });
  }
  console.log('✅ Permissions created');

  // ── 3. Assign Permissions to Roles ──────────────────────────
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
        update: {}, create: { roleId: adminRole.id, permissionId: p.id },
      });
    }
  }
  if (productManagerRole) {
    const managerPerms = allPerms.filter((p: any) => ['product', 'inventory', 'order', 'cms', 'analytics'].includes(p.resource));
    for (const p of managerPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: productManagerRole.id, permissionId: p.id } },
        update: {}, create: { roleId: productManagerRole.id, permissionId: p.id },
      });
    }
  }
  if (supportRole) {
    const supportPerms = allPerms.filter((p: any) => p.resource === 'ticket' || (p.resource === 'order' && p.action === 'read') || (p.resource === 'customer' && p.action === 'read'));
    for (const p of supportPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: supportRole.id, permissionId: p.id } },
        update: {}, create: { roleId: supportRole.id, permissionId: p.id },
      });
    }
  }
  console.log('✅ Role permissions assigned');

  // ── 4. Create Staff Users (Admin, Product Manager, Customer Support) ──
  console.log('Creating staff users...');
  if (adminRole) {
    const passwordHash = await bcrypt.hash('admin123', SALT_ROUNDS);
    await prisma.user.upsert({
      where: { id: 'admin_user' }, update: {},
      create: {
        id: 'admin_user', email: 'admin@voltra.com', passwordHash,
        roleId: adminRole.id, isEmailVerified: true,
        staffProfile: { create: { roleId: adminRole.id, firstName: 'Super', lastName: 'Admin', phone: '0000000000' } }
      },
    });
    console.log('  - Admin: admin@voltra.com / admin123');
  }

  if (productManagerRole) {
    const passwordHash = await bcrypt.hash('staff123', SALT_ROUNDS);
    await prisma.user.upsert({
      where: { id: 'staff_user' }, update: {},
      create: {
        id: 'staff_user', email: 'staff@voltra.com', passwordHash,
        roleId: productManagerRole.id, isEmailVerified: true,
        staffProfile: { create: { roleId: productManagerRole.id, firstName: 'Product', lastName: 'Manager', phone: '1111111111' } }
      },
    });
    console.log('  - Staff PM: staff@voltra.com / staff123');
  }

  if (supportRole) {
    const passwordHash = await bcrypt.hash('support123', SALT_ROUNDS);
    await prisma.user.upsert({
      where: { id: 'support_user' }, update: {},
      create: {
        id: 'support_user', email: 'support@voltra.com', passwordHash,
        roleId: supportRole.id, isEmailVerified: true,
        staffProfile: { create: { roleId: supportRole.id, firstName: 'Support', lastName: 'Agent', phone: '2222222222' } }
      },
    });
    console.log('  - Support: support@voltra.com / support123');
  }
  console.log('✅ Staff users created');

  // ── 5. Create Customer Users & Addresses ─────────────────────
  console.log('Creating customer users and addresses...');
  if (customerRole) {
    // Customer 1 with 2 addresses (1 default)
    const passwordHash1 = await bcrypt.hash('customer123', SALT_ROUNDS);
    const customer1 = await prisma.user.upsert({
      where: { id: 'customer_1' }, update: {},
      create: {
        id: 'customer_1', email: 'customer1@voltra.com', passwordHash: passwordHash1,
        roleId: customerRole.id, isEmailVerified: true,
        customerProfile: { create: { firstName: 'John', lastName: 'Doe', phone: '3333333333' } }
      },
    });

    await prisma.address.createMany({
      data: [
        {
          userId: customer1.id, label: 'Home', fullName: 'John Doe', phone: '3333333333',
          addressLine1: '123 Main St', city: 'New York', state: 'NY', postalCode: '10001', country: 'US', isDefault: true
        },
        {
          userId: customer1.id, label: 'Beach House', fullName: 'John Doe', phone: '3333333333',
          addressLine1: '789 Ocean Ave', city: 'Brooklyn', state: 'NY', postalCode: '11201', country: 'US', isDefault: false
        }
      ]
    });
    console.log('  - Customer 1: customer1@voltra.com / customer123 (2 addresses, 1 default)');

    // Customer 2 with 2 addresses (1 default)
    const passwordHash2 = await bcrypt.hash('customer456', SALT_ROUNDS);
    const customer2 = await prisma.user.upsert({
      where: { id: 'customer_2' }, update: {},
      create: {
        id: 'customer_2', email: 'customer2@voltra.com', passwordHash: passwordHash2,
        roleId: customerRole.id, isEmailVerified: true,
        customerProfile: { create: { firstName: 'Jane', lastName: 'Smith', phone: '4444444444' } }
      },
    });

    await prisma.address.createMany({
      data: [
        {
          userId: customer2.id, label: 'Office', fullName: 'Jane Smith', phone: '4444444444',
          addressLine1: '456 Business Rd', city: 'San Francisco', state: 'CA', postalCode: '94107', country: 'US', isDefault: true
        },
        {
          userId: customer2.id, label: 'Parents Home', fullName: 'Jane Smith', phone: '4444444444',
          addressLine1: '321 Market St', city: 'San Jose', state: 'CA', postalCode: '95113', country: 'US', isDefault: false
        }
      ]
    });
    console.log('  - Customer 2: customer2@voltra.com / customer456 (2 addresses, 1 default)');
  }

  // ── 6. Create 6 Fixed Categories ──────────────────────────────
  console.log('Creating 6 fixed categories...');
  const laptopCat = await prisma.category.upsert({
    where: { slug: 'laptop' }, update: { hasVariants: true, isActive: true },
    create: { name: 'Laptop', slug: 'laptop', description: 'High performance laptops', isActive: true, hasVariants: true }
  });
  const phoneCat = await prisma.category.upsert({
    where: { slug: 'phone' }, update: { hasVariants: true, isActive: true },
    create: { name: 'Phone', slug: 'phone', description: 'Smartphones & mobile devices', isActive: true, hasVariants: true }
  });
  const tabletCat = await prisma.category.upsert({
    where: { slug: 'tablet' }, update: { hasVariants: true, isActive: true },
    create: { name: 'Tablet', slug: 'tablet', description: 'Portable tablets', isActive: true, hasVariants: true }
  });
  const audioCat = await prisma.category.upsert({
    where: { slug: 'audio' }, update: { hasVariants: true, isActive: true },
    create: { name: 'Audio', slug: 'audio', description: 'Headphones & audio tech', isActive: true, hasVariants: true }
  });
  const accessoriesCat = await prisma.category.upsert({
    where: { slug: 'accessories' }, update: { hasVariants: false, isActive: true },
    create: { name: 'Accessories', slug: 'accessories', description: 'Chargers, power banks, & gear', isActive: true, hasVariants: false }
  });
  const dronesCat = await prisma.category.upsert({
    where: { slug: 'drones' }, update: { hasVariants: false, isActive: true },
    create: { name: 'Drones', slug: 'drones', description: 'Drones & aerial cameras', isActive: true, hasVariants: false }
  });
  console.log('✅ 6 Categories created');

  // Helper function to create product with 3 variants or 1 default variant (all with 15 stock)
  const seedProductWithVariants = async (params: {
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    categoryId: string;
    brand?: string;
    optionsConfig?: Array<{ name: string; values: Array<{ value: string; priceDelta: number }> }>;
    variantsConfig?: Array<{ sku: string; optionValueIndices: number[]; customPrice?: number }>;
  }) => {
    const product = await prisma.product.upsert({
      where: { slug: params.slug },
      update: { basePrice: params.basePrice, categoryId: params.categoryId, status: 'ACTIVE' },
      create: {
        name: params.name, slug: params.slug, description: params.description,
        basePrice: params.basePrice, categoryId: params.categoryId, brand: params.brand || 'Voltra', status: 'ACTIVE',
      }
    });

    // Clean existing options and variants for fresh seed
    await prisma.productOption.deleteMany({ where: { productId: product.id } });
    await prisma.variant.deleteMany({ where: { productId: product.id } });

    if (params.optionsConfig && params.optionsConfig.length > 0) {
      // Create options and option values
      const createdOptions: any[] = [];
      for (let pos = 0; pos < params.optionsConfig.length; pos++) {
        const optCfg = params.optionsConfig[pos];
        const opt = await prisma.productOption.create({
          data: {
            productId: product.id, name: optCfg.name, position: pos,
            values: { create: optCfg.values.map(v => ({ value: v.value, priceDelta: v.priceDelta })) }
          },
          include: { values: true }
        });
        createdOptions.push(opt);
      }

      // Flat map of all option values
      const allOptionValues = createdOptions.flatMap(o => o.values);

      // Create 3 variants (15 stock each)
      if (params.variantsConfig) {
        for (const vCfg of params.variantsConfig) {
          const selectedOptionValues = vCfg.optionValueIndices.map(idx => allOptionValues[idx]).filter(Boolean);
          const totalDelta = selectedOptionValues.reduce((sum, ov) => sum + Number(ov.priceDelta), 0);
          const finalPrice = vCfg.customPrice ?? (params.basePrice + totalDelta);
          const name = selectedOptionValues.map(ov => ov.value).join(' / ');

          await prisma.variant.create({
            data: {
              productId: product.id,
              sku: vCfg.sku,
              name,
              price: finalPrice,
              isDefault: false,
              isActive: true,
              inventory: { create: { quantity: 15 } },
              optionValues: {
                create: selectedOptionValues.map(ov => ({ optionValueId: ov.id }))
              }
            }
          });
        }
      }
    } else {
      // Products WITHOUT variants — 1 Default Variant with 15 stock
      await prisma.variant.create({
        data: {
          productId: product.id,
          sku: `${params.slug.toUpperCase().slice(0, 8)}-DEFAULT`,
          name: 'Default',
          price: params.basePrice,
          isDefault: true,
          isActive: true,
          inventory: { create: { quantity: 15 } }
        }
      });
    }
  };

  // ── 7. Seed 2 Products per Category (Total 12 Products) ────────
  console.log('Seeding 2 products per category with 15 stock for variants...');

  // Category 1: LAPTOP (2 products)
  await seedProductWithVariants({
    name: 'Voltra Laptop Pro 14', slug: 'voltra-laptop-pro-14',
    description: '14-inch M3 Pro powerhouse for creators.', basePrice: 999.00, categoryId: laptopCat.id,
    optionsConfig: [
      { name: 'Color', values: [{ value: 'Space Gray', priceDelta: 0 }, { value: 'Silver', priceDelta: 20 }] },
      { name: 'RAM', values: [{ value: '16GB', priceDelta: 0 }, { value: '32GB', priceDelta: 80 }] },
      { name: 'Storage', values: [{ value: '512GB SSD', priceDelta: 0 }, { value: '1TB SSD', priceDelta: 120 }] },
    ],
    // indices in flattened values: 0:SG, 1:SV, 2:16G, 3:32G, 4:512G, 5:1TB
    variantsConfig: [
      { sku: 'VLP14-SG-16-512', optionValueIndices: [0, 2, 4] },
      { sku: 'VLP14-SG-32-1TB', optionValueIndices: [0, 3, 5] },
      { sku: 'VLP14-SV-16-1TB', optionValueIndices: [1, 2, 5] },
    ]
  });

  await seedProductWithVariants({
    name: 'Voltra Laptop Air 13', slug: 'voltra-laptop-air-13',
    description: 'Ultra-thin lightweight laptop with all-day battery.', basePrice: 799.00, categoryId: laptopCat.id,
    optionsConfig: [
      { name: 'Color', values: [{ value: 'Midnight', priceDelta: 0 }, { value: 'Starlight', priceDelta: 15 }] },
      { name: 'Storage', values: [{ value: '256GB SSD', priceDelta: 0 }, { value: '512GB SSD', priceDelta: 100 }] },
    ],
    // indices: 0:MN, 1:SL, 2:256G, 3:512G
    variantsConfig: [
      { sku: 'VLA13-MN-256', optionValueIndices: [0, 2] },
      { sku: 'VLA13-MN-512', optionValueIndices: [0, 3] },
      { sku: 'VLA13-SL-512', optionValueIndices: [1, 3] },
    ]
  });
  console.log('  - Laptop products & variants created');

  // Category 2: PHONE (2 products)
  await seedProductWithVariants({
    name: 'Voltra Phone 15 Pro', slug: 'voltra-phone-15-pro',
    description: 'Titanium design with pro camera system.', basePrice: 899.00, categoryId: phoneCat.id,
    optionsConfig: [
      { name: 'Color', values: [{ value: 'Titanium', priceDelta: 0 }, { value: 'Cobalt', priceDelta: 10 }] },
      { name: 'Storage', values: [{ value: '128GB', priceDelta: 0 }, { value: '256GB', priceDelta: 50 }, { value: '512GB', priceDelta: 150 }] },
    ],
    // indices: 0:TI, 1:CB, 2:128G, 3:256G, 4:512G
    variantsConfig: [
      { sku: 'VP15P-TI-128', optionValueIndices: [0, 2] },
      { sku: 'VP15P-TI-256', optionValueIndices: [0, 3] },
      { sku: 'VP15P-CB-512', optionValueIndices: [1, 4] },
    ]
  });

  await seedProductWithVariants({
    name: 'Voltra Phone Ultra', slug: 'voltra-phone-ultra',
    description: 'Flagship phone with 200MP camera and stylus.', basePrice: 1099.00, categoryId: phoneCat.id,
    optionsConfig: [
      { name: 'Color', values: [{ value: 'Phantom Black', priceDelta: 0 }, { value: 'Emerald', priceDelta: 20 }] },
      { name: 'Storage', values: [{ value: '256GB', priceDelta: 0 }, { value: '512GB', priceDelta: 100 }] },
    ],
    // indices: 0:PB, 1:EM, 2:256G, 3:512G
    variantsConfig: [
      { sku: 'VPU-PB-256', optionValueIndices: [0, 2] },
      { sku: 'VPU-PB-512', optionValueIndices: [0, 3] },
      { sku: 'VPU-EM-512', optionValueIndices: [1, 3] },
    ]
  });
  console.log('  - Phone products & variants created');

  // Category 3: TABLET (2 products)
  await seedProductWithVariants({
    name: 'Voltra Pad Pro', slug: 'voltra-pad-pro',
    description: '12.9-inch Liquid Retina display for digital artists.', basePrice: 499.00, categoryId: tabletCat.id,
    optionsConfig: [
      { name: 'Color', values: [{ value: 'Space Gray', priceDelta: 0 }, { value: 'Blue', priceDelta: 2 }] },
      { name: 'Storage', values: [{ value: '128GB', priceDelta: 25 }, { value: '256GB', priceDelta: 50 }] },
    ],
    // indices: 0:SG, 1:BL, 2:128G, 3:256G
    variantsConfig: [
      { sku: 'VPP-SG-128', optionValueIndices: [0, 2] },
      { sku: 'VPP-SG-256', optionValueIndices: [0, 3] },
      { sku: 'VPP-BL-256', optionValueIndices: [1, 3] },
    ]
  });

  await seedProductWithVariants({
    name: 'Voltra Pad Mini', slug: 'voltra-pad-mini',
    description: 'Compact 8.3-inch tablet that fits in your hand.', basePrice: 399.00, categoryId: tabletCat.id,
    optionsConfig: [
      { name: 'Color', values: [{ value: 'Silver', priceDelta: 0 }, { value: 'Rose', priceDelta: 10 }] },
      { name: 'Connectivity', values: [{ value: 'Wi-Fi', priceDelta: 0 }, { value: 'Wi-Fi + Cellular', priceDelta: 100 }] },
    ],
    // indices: 0:SV, 1:RS, 2:WIFI, 3:CELL
    variantsConfig: [
      { sku: 'VPM-SV-WIFI', optionValueIndices: [0, 2] },
      { sku: 'VPM-SV-CELL', optionValueIndices: [0, 3] },
      { sku: 'VPM-RS-CELL', optionValueIndices: [1, 3] },
    ]
  });
  console.log('  - Tablet products & variants created');

  // Category 4: AUDIO (2 products)
  await seedProductWithVariants({
    name: 'Voltra Headphones Pro', slug: 'voltra-headphones-pro',
    description: 'Noise cancelling over-ear studio headphones.', basePrice: 199.00, categoryId: audioCat.id,
    optionsConfig: [
      { name: 'Color', values: [{ value: 'Midnight Black', priceDelta: 0 }, { value: 'Pearl White', priceDelta: 0 }, { value: 'Cobalt Blue', priceDelta: 10 }] }
    ],
    // indices: 0:BLK, 1:WHT, 2:BLU
    variantsConfig: [
      { sku: 'VHP-BLK', optionValueIndices: [0] },
      { sku: 'VHP-WHT', optionValueIndices: [1] },
      { sku: 'VHP-BLU', optionValueIndices: [2] },
    ]
  });

  await seedProductWithVariants({
    name: 'Voltra Buds Wireless', slug: 'voltra-buds-wireless',
    description: 'True wireless in-ear earbuds with spatial audio.', basePrice: 129.00, categoryId: audioCat.id,
    optionsConfig: [
      { name: 'Color', values: [{ value: 'Graphite', priceDelta: 0 }, { value: 'White', priceDelta: 0 }, { value: 'Neon Green', priceDelta: 5 }] }
    ],
    // indices: 0:GRP, 1:WHT, 2:GRN
    variantsConfig: [
      { sku: 'VBW-GRP', optionValueIndices: [0] },
      { sku: 'VBW-WHT', optionValueIndices: [1] },
      { sku: 'VBW-GRN', optionValueIndices: [2] },
    ]
  });
  console.log('  - Audio products & variants created');

  // Category 5: ACCESSORIES (2 single products, no variants)
  await seedProductWithVariants({
    name: 'Voltra 65W GaN Fast Charger', slug: 'voltra-fast-charger-65w',
    description: 'Universal 65W GaN fast charger with 3 ports.', basePrice: 49.00, categoryId: accessoriesCat.id
  });

  await seedProductWithVariants({
    name: 'Voltra Wireless Power Bank 10K', slug: 'voltra-power-bank-10k',
    description: '10000mAh magnetic wireless power bank with stand.', basePrice: 39.00, categoryId: accessoriesCat.id
  });
  console.log('  - Accessory products & default variants created');

  // Category 6: DRONES (2 single products, no variants)
  await seedProductWithVariants({
    name: 'Voltra Sky Explorer 4K', slug: 'voltra-sky-explorer-4k',
    description: '4K aerial drone with 30-min flight time and GPS return.', basePrice: 499.00, categoryId: dronesCat.id
  });

  // ── 7.5 Seed Real Product Reviews in PostgreSQL ────────────────
  console.log('Seeding product reviews into PostgreSQL...');
  const allProducts = await prisma.product.findMany();

  for (const prod of allProducts) {
    await prisma.review.createMany({
      data: [
        {
          userId: 'customer_1',
          productId: prod.id,
          rating: 5,
          title: `Incredible quality for ${prod.name}`,
          comment: `I've been using this ${prod.name} for 2 weeks now. Performance is exceptionally smooth and build quality feels truly premium!`,
          isVerifiedPurchase: true,
          isApproved: true,
        },
        {
          userId: 'customer_2',
          productId: prod.id,
          rating: 4,
          title: `Great value & fast delivery`,
          comment: `Shipped extremely fast from Voltra. The packaging for ${prod.name} was immaculate and setup took less than 5 minutes. Highly recommended!`,
          isVerifiedPurchase: true,
          isApproved: true,
        },
      ],
      skipDuplicates: true,
    });
  }
  console.log('  - Authentic reviews seeded for all products in database');

  // ── 8. Create Coupons ────────────────────────────────────────
  console.log('Creating coupons...');
  await prisma.coupon.upsert({
    where: { code: 'WELCOME30' }, update: { discountValue: 30 },
    create: {
      code: 'WELCOME30', description: '30% off your order', discountType: 'PERCENTAGE',
      discountValue: 30, usageLimit: 1000, validFrom: new Date(),
      validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    }
  });

  await prisma.coupon.upsert({
    where: { code: 'SUMMER50' }, update: { discountValue: 50 },
    create: {
      code: 'SUMMER50', description: '50% off summer sale', discountType: 'PERCENTAGE',
      discountValue: 50, usageLimit: 1000, validFrom: new Date(),
      validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    }
  });
  console.log('  - WELCOME30 (30% off) & SUMMER50 (50% off) created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('  Admin User:   admin@voltra.com   / admin123');
  console.log('  Staff PM:     staff@voltra.com   / staff123');
  console.log('  Support User: support@voltra.com / support123');
  console.log('  Customer 1:   customer1@voltra.com / customer123 (2 addresses)');
  console.log('  Customer 2:   customer2@voltra.com / customer456 (2 addresses)');
  console.log('─────────────────────────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
