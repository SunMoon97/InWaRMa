import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { parse } from 'csv-parse';
import fs from 'fs';
import { Request } from 'express';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'InWaRMa API is running' });
});

// Products API
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        inventoryItems: true,
        _count: {
          select: {
            alerts: true,
            promotions: true
          }
        }
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, sku, category, description, unit } = req.body;
    const product = await prisma.product.create({
      data: { name, sku, category, description, unit }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Inventory API
app.get('/api/inventory', async (req, res) => {
  try {
    const inventory = await prisma.inventoryItem.findMany({
      include: {
        product: true,
        alerts: true
      },
      orderBy: { expiryDate: 'asc' }
    });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const { productId, batchNumber, quantity, unitPrice, expiryDate, location } = req.body;
    const inventoryItem = await prisma.inventoryItem.create({
      data: { productId, batchNumber, quantity, unitPrice, expiryDate: new Date(expiryDate), location }
    });
    res.status(201).json(inventoryItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

// Alerts API
app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      include: {
        product: true,
        inventoryItem: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

app.patch('/api/alerts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isRead, isResolved } = req.body;
    const alert = await prisma.alert.update({
      where: { id },
      data: { isRead, isResolved }
    });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// Promotions API
app.get('/api/promotions', async (req, res) => {
  try {
    const promotions = await prisma.promotion.findMany({
      include: {
        product: true
      },
      where: {
        isActive: true,
        endDate: {
          gte: new Date()
        }
      }
    });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
});

// Pickups API
app.get('/api/pickups', async (req, res) => {
  try {
    const pickups = await prisma.pickup.findMany({
      include: {
        items: {
          include: {
            inventoryItem: {
              include: {
                product: true
              }
            }
          }
        }
      },
      orderBy: { pickupDate: 'asc' }
    });
    res.json(pickups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pickups' });
  }
});

app.post('/api/pickups', async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, pickupDate, notes, items } = req.body;
    const pickup = await prisma.pickup.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        pickupDate: new Date(pickupDate),
        notes,
        items: {
          create: items.map((item: any) => ({
            inventoryItemId: item.inventoryItemId,
            quantity: item.quantity
          }))
        }
      },
      include: {
        items: {
          include: {
            inventoryItem: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });
    res.status(201).json(pickup);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pickup' });
  }
});

// Analytics API
app.get('/api/analytics', async (req, res) => {
  try {
    const [
      totalProducts,
      totalInventoryItems,
      activeAlerts,
      expiringItems,
      totalValue
    ] = await Promise.all([
      prisma.product.count(),
      prisma.inventoryItem.count(),
      prisma.alert.count({ where: { isResolved: false } }),
      prisma.inventoryItem.count({
        where: {
          expiryDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          },
          status: 'ACTIVE'
        }
      }),
      prisma.inventoryItem.aggregate({
        _sum: {
          quantity: true
        },
        where: {
          status: 'ACTIVE'
        }
      })
    ]);

    res.json({
      totalProducts,
      totalInventoryItems,
      activeAlerts,
      expiringItems,
      totalValue: totalValue._sum.quantity || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// CSV Upload Endpoint
app.post('/api/upload-csv', upload.single('file'), async (req: Request, res) => {
  const file = (req as Request & { file?: Express.Multer.File }).file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const filePath = file.path;
  const results: any[] = [];
  try {
    // Read and parse the CSV file
    const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, skip_empty_lines: true }));
    for await (const record of parser) {
      results.push(record);
    }
    // Insert products and inventory items
    for (const row of results) {
      let product = await prisma.product.findFirst({ where: { sku: row.sku } });
      if (!product) {
        product = await prisma.product.create({
          data: {
            name: row.name,
            sku: row.sku,
            category: row.category,
            description: row.description,
            unit: row.unit
          }
        });
      }
      await prisma.inventoryItem.create({
        data: {
          productId: product.id,
          batchNumber: row.batchNumber,
          quantity: Number(row.quantity),
          unitPrice: Number(row.unitPrice),
          expiryDate: new Date(row.expiryDate),
          location: row.location
        }
      });
    }
    fs.unlinkSync(filePath); // Clean up uploaded file
    res.json({ message: 'CSV uploaded and data imported successfully', count: results.length });
  } catch (error: any) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: 'Failed to import CSV', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 InWaRMa API server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
}); 