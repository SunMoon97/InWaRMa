import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample products
  const products = [
    {
      name: 'Organic Milk',
      sku: 'MILK001',
      category: 'Dairy',
      description: 'Fresh organic whole milk',
      unit: 'L'
    },
    {
      name: 'Greek Yogurt',
      sku: 'YOG001',
      category: 'Dairy',
      description: 'Natural Greek yogurt',
      unit: 'L'
    },
    {
      name: 'Aspirin 500mg',
      sku: 'ASP001',
      category: 'Pharmaceuticals',
      description: 'Pain relief tablets',
      unit: 'box'
    },
    {
      name: 'Vitamin C Supplements',
      sku: 'VIT001',
      category: 'Pharmaceuticals',
      description: 'Vitamin C tablets 1000mg',
      unit: 'bottle'
    },
    {
      name: 'Hand Soap',
      sku: 'SOAP001',
      category: 'Personal Care',
      description: 'Antibacterial hand soap',
      unit: 'bottle'
    },
    {
      name: 'Toothpaste',
      sku: 'TOOTH001',
      category: 'Personal Care',
      description: 'Fluoride toothpaste',
      unit: 'tube'
    },
    {
      name: 'Bread',
      sku: 'BREAD001',
      category: 'Food',
      description: 'Whole grain bread',
      unit: 'loaf'
    },
    {
      name: 'Eggs',
      sku: 'EGG001',
      category: 'Food',
      description: 'Fresh farm eggs',
      unit: 'dozen'
    }
  ];

  console.log('📦 Creating products...');
  for (const productData of products) {
    await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: productData
    });
  }

  // Get all products
  const allProducts = await prisma.product.findMany();

  // Create sample inventory items
  console.log('📦 Creating inventory items...');
  for (const product of allProducts) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + Math.floor(Math.random() * 30) + 7);

    await prisma.inventoryItem.create({
      data: {
        productId: product.id,
        batchNumber: `${product.sku}-B001`,
        quantity: Math.floor(Math.random() * 200) + 50,
        unitPrice: Math.random() * 10 + 2,
        expiryDate,
        location: `Warehouse ${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`,
        status: 'ACTIVE'
      }
    });
  }

  // Create sample alerts
  console.log('🔔 Creating alerts...');
  for (const product of allProducts.slice(0, 3)) {
    await prisma.alert.create({
      data: {
        productId: product.id,
        type: 'LOW_STOCK',
        severity: 'MEDIUM',
        message: `Low stock alert for ${product.name}`,
        isRead: false,
        isResolved: false
      }
    });
  }

  // Create sample promotions
  console.log('🎯 Creating promotions...');
  for (const product of allProducts.slice(0, 2)) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    await prisma.promotion.create({
      data: {
        productId: product.id,
        title: `Special Offer - ${product.name}`,
        description: `Get 20% off on ${product.name}`,
        discountPercentage: 20,
        startDate,
        endDate,
        isActive: true
      }
    });
  }

  // Create sample pickups
  console.log('🚚 Creating pickups...');
  const pickupDate = new Date();
  pickupDate.setDate(pickupDate.getDate() + 2);

  const pickup = await prisma.pickup.create({
    data: {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '+1234567890',
      pickupDate,
      status: 'PENDING',
      notes: 'Customer requested early pickup'
    }
  });

  // Add items to pickup
  const inventoryItems = await prisma.inventoryItem.findMany({
    take: 2
  });

  for (const item of inventoryItems) {
    await prisma.pickupItem.create({
      data: {
        pickupId: pickup.id,
        inventoryItemId: item.id,
        quantity: Math.floor(Math.random() * 10) + 1
      }
    });
  }

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 