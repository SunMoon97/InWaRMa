import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with sample data...');

  // Sample products
  const products = [
    {
      name: 'Fresh Milk',
      sku: 'MLK001',
      category: 'Dairy',
      description: 'Fresh whole milk from local farms',
      unit: 'L'
    },
    {
      name: 'Greek Yogurt',
      sku: 'YOG001',
      category: 'Dairy',
      description: 'Natural Greek yogurt with probiotics',
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
      name: 'Vitamin C',
      sku: 'VIT001',
      category: 'Pharmaceuticals',
      description: 'Vitamin C supplements',
      unit: 'bottle'
    },
    {
      name: 'Face Cream',
      sku: 'CRM001',
      category: 'Cosmetics',
      description: 'Moisturizing face cream',
      unit: 'tube'
    },
    {
      name: 'Shampoo',
      sku: 'SHP001',
      category: 'Personal Care',
      description: 'Hair care shampoo',
      unit: 'bottle'
    },
    {
      name: 'Bread',
      sku: 'BRD001',
      category: 'Food',
      description: 'Fresh whole grain bread',
      unit: 'loaf'
    },
    {
      name: 'Cheese',
      sku: 'CHS001',
      category: 'Dairy',
      description: 'Aged cheddar cheese',
      unit: 'kg'
    }
  ];

  // Create products
  for (const productData of products) {
    const existingProduct = await prisma.product.findFirst({
      where: { sku: productData.sku }
    });

    if (!existingProduct) {
      await prisma.product.create({
        data: productData
      });
      console.log(`✅ Created product: ${productData.name}`);
    } else {
      console.log(`⏭️  Product already exists: ${productData.name}`);
    }
  }

  // Get all products for inventory creation
  const allProducts = await prisma.product.findMany();

  // Sample inventory items
  const inventoryItems = [
    {
      productSku: 'MLK001',
      batchNumber: 'MLK001-B001',
      quantity: 100,
      unitPrice: 2.50,
      expiryDate: new Date('2024-02-15'),
      location: 'Warehouse A'
    },
    {
      productSku: 'YOG001',
      batchNumber: 'YOG001-B001',
      quantity: 50,
      unitPrice: 3.00,
      expiryDate: new Date('2024-02-10'),
      location: 'Warehouse A'
    },
    {
      productSku: 'ASP001',
      batchNumber: 'ASP001-B001',
      quantity: 200,
      unitPrice: 5.00,
      expiryDate: new Date('2025-12-31'),
      location: 'Warehouse B'
    },
    {
      productSku: 'VIT001',
      batchNumber: 'VIT001-B001',
      quantity: 150,
      unitPrice: 12.00,
      expiryDate: new Date('2025-06-30'),
      location: 'Warehouse B'
    },
    {
      productSku: 'CRM001',
      batchNumber: 'CRM001-B001',
      quantity: 75,
      unitPrice: 15.50,
      expiryDate: new Date('2024-08-15'),
      location: 'Warehouse C'
    },
    {
      productSku: 'SHP001',
      batchNumber: 'SHP001-B001',
      quantity: 80,
      unitPrice: 8.50,
      expiryDate: new Date('2024-06-30'),
      location: 'Warehouse C'
    },
    {
      productSku: 'BRD001',
      batchNumber: 'BRD001-B001',
      quantity: 60,
      unitPrice: 3.50,
      expiryDate: new Date('2024-01-20'),
      location: 'Warehouse A'
    },
    {
      productSku: 'CHS001',
      batchNumber: 'CHS001-B001',
      quantity: 40,
      unitPrice: 8.00,
      expiryDate: new Date('2024-03-15'),
      location: 'Warehouse A'
    }
  ];

  // Create inventory items
  for (const itemData of inventoryItems) {
    const product = allProducts.find(p => p.sku === itemData.productSku);
    if (product) {
      await prisma.inventoryItem.create({
        data: {
          productId: product.id,
          batchNumber: itemData.batchNumber,
          quantity: itemData.quantity,
          unitPrice: itemData.unitPrice,
          expiryDate: itemData.expiryDate,
          location: itemData.location
        }
      });
      console.log(`✅ Created inventory item: ${product.name} - ${itemData.batchNumber}`);
    }
  }

  // Create some sample alerts
  const alertItems = [
    {
      productSku: 'MLK001',
      type: 'EXPIRY_WARNING' as const,
      message: 'Milk batch MLK001-B001 expires in 5 days',
      severity: 'MEDIUM' as const
    },
    {
      productSku: 'BRD001',
      type: 'LOW_STOCK' as const,
      message: 'Bread stock is running low',
      severity: 'HIGH' as const
    }
  ];

  for (const alertData of alertItems) {
    const product = allProducts.find(p => p.sku === alertData.productSku);
    if (product) {
      await prisma.alert.create({
        data: {
          productId: product.id,
          type: alertData.type,
          message: alertData.message,
          severity: alertData.severity
        }
      });
      console.log(`✅ Created alert: ${alertData.message}`);
    }
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 