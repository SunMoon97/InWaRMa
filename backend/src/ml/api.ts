import express from 'express';
import { PrismaClient } from '@prisma/client';
import { HybridPredictor, MultiArmedBanditSystem, PolynomialRegressionPredictor } from './bandit-system';

const router = express.Router();
const prisma = new PrismaClient();
const hybridPredictor = new HybridPredictor(prisma);
const banditSystem = new MultiArmedBanditSystem(prisma);
const polynomialPredictor = new PolynomialRegressionPredictor(prisma);

// Get order prediction for a product
router.get('/predict/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { leadTime = 14 } = req.query;

    // Get current inventory for the product
    const currentInventory = await prisma.inventoryItem.aggregate({
      where: {
        productId,
        status: 'ACTIVE'
      },
      _sum: {
        quantity: true
      }
    });

    const currentStock = currentInventory._sum.quantity || 0;

    // Generate prediction
    const prediction = await hybridPredictor.predictOrder(
      productId,
      currentStock,
      Number(leadTime)
    );

    // Store prediction
    await prisma.orderPrediction.create({
      data: {
        productId,
        predictedQuantity: prediction.predictedQuantity,
        predictedOrderDate: prediction.predictedOrderDate,
        confidence: prediction.confidence,
        algorithm: prediction.algorithm,
        features: prediction.features
      }
    });

    res.json({
      success: true,
      prediction,
      currentStock,
      productId
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate prediction',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get bandit arms for a product
router.get('/bandit/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }

    let arms = await prisma.banditArm.findMany({
      where: { productId },
      orderBy: { averageReward: 'desc' }
    });

    // If no arms exist, initialize them
    if (arms.length === 0) {
      console.log(`Initializing bandit arms for product: ${productId}`);
      await banditSystem.initializeBanditArms(productId);
      arms = await prisma.banditArm.findMany({
        where: { productId },
        orderBy: { averageReward: 'desc' }
      });
    }

    // Ensure we only have 4 arms (one of each type)
    const expectedArmTypes = ['conservative', 'aggressive', 'balanced', 'seasonal'];
    const uniqueArms = arms.filter((arm, index, self) => 
      index === self.findIndex(a => a.armType === arm.armType)
    );

    // If we have duplicate arms, clean them up
    if (arms.length > 4) {
      console.log(`Cleaning up duplicate arms for product: ${productId}`);
      // Keep only the first occurrence of each arm type
      const armIdsToKeep = uniqueArms.map(arm => arm.id);
      
      // Delete duplicate arms
      await prisma.banditArm.deleteMany({
        where: {
          productId,
          id: { notIn: armIdsToKeep }
        }
      });

      // Fetch the cleaned arms
      arms = await prisma.banditArm.findMany({
        where: { productId },
        orderBy: { averageReward: 'desc' }
      });
    }

    res.json({ success: true, arms });
  } catch (error) {
    console.error('Bandit arms error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch bandit arms',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get demand forecast using polynomial regression
router.get('/forecast/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { days = 30 } = req.query;

    const forecastDate = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000);
    const forecast = await polynomialPredictor.predictDemand(productId, forecastDate);

    res.json({
      success: true,
      forecast: {
        date: forecastDate,
        predictedDemand: forecast.predictedDemand,
        confidence: forecast.confidence
      }
    });
  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate forecast' 
    });
  }
});

// Update system after order completion
router.post('/update-order', async (req, res) => {
  try {
    const {
      productId,
      armId,
      predictedDemand,
      actualDemand,
      orderCost,
      revenue,
      holdingCost
    } = req.body;

    console.log('Updating order with data:', {
      productId,
      armId,
      predictedDemand,
      actualDemand,
      orderCost,
      revenue,
      holdingCost
    });

    // Check if arm exists
    const arm = await prisma.banditArm.findUnique({
      where: { id: armId }
    });

    if (!arm) {
      console.log(`Arm ${armId} not found, skipping update`);
      return res.json({ success: true, message: 'Arm not found, skipping update' });
    }

    // Calculate reward
    const reward = banditSystem.calculateReward(
      predictedDemand,
      actualDemand,
      orderCost,
      revenue,
      holdingCost
    );

    console.log(`Calculated reward: ${reward}`);

    // Update bandit arm
    await banditSystem.updateArmReward(armId, reward);

    // Store order history
    await prisma.orderHistory.create({
      data: {
        productId,
        orderDate: new Date(),
        orderQuantity: predictedDemand,
        actualDemand,
        leadTime: 14,
        cost: orderCost,
        revenue,
        profit: revenue - orderCost - holdingCost,
        seasonality: getSeasonFromDate(new Date()),
        externalFactors: {}
      }
    });

    console.log('Order update completed successfully');
    res.json({ success: true, message: 'Order updated successfully' });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get order history for a product
router.get('/history/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 50 } = req.query;

    const history = await prisma.orderHistory.findMany({
      where: { productId },
      orderBy: { orderDate: 'desc' },
      take: Number(limit)
    });

    res.json({ success: true, history });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch order history' 
    });
  }
});

// Get all predictions for a product
router.get('/predictions/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 20 } = req.query;

    const predictions = await prisma.orderPrediction.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    });

    res.json({ success: true, predictions });
  } catch (error) {
    console.error('Predictions error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch predictions' 
    });
  }
});

// Get analytics for ML system
router.get('/analytics/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const [
      totalOrders,
      totalPredictions,
      banditArms,
      recentHistory
    ] = await Promise.all([
      prisma.orderHistory.count({ where: { productId } }),
      prisma.orderPrediction.count({ where: { productId } }),
      prisma.banditArm.findMany({ where: { productId } }),
      prisma.orderHistory.findMany({
        where: { productId },
        orderBy: { orderDate: 'desc' },
        take: 10
      })
    ]);

    // Calculate accuracy metrics
    let accuracy = 0;
    let avgConfidence = 0;

    if (recentHistory.length > 0) {
      const accuracyScores = recentHistory.map(order => {
        const prediction = order.orderQuantity;
        const actual = order.actualDemand;
        return 1 - Math.abs(prediction - actual) / actual;
      });
      accuracy = accuracyScores.reduce((a, b) => a + b, 0) / accuracyScores.length;
    }

    const recentPredictions = await prisma.orderPrediction.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (recentPredictions.length > 0) {
      avgConfidence = recentPredictions.reduce((sum, pred) => sum + pred.confidence, 0) / recentPredictions.length;
    }

    res.json({
      success: true,
      analytics: {
        totalOrders,
        totalPredictions,
        accuracy: Math.round(accuracy * 100) / 100,
        avgConfidence: Math.round(avgConfidence * 100) / 100,
        banditArms: banditArms.map(arm => ({
          type: arm.armType,
          pullCount: arm.pullCount,
          averageReward: arm.averageReward,
          explorationRate: arm.explorationRate
        })),
        recentHistory: recentHistory.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch analytics' 
    });
  }
});

// Initialize ML system for a product
router.post('/initialize/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    console.log(`Initializing ML system for product: ${productId}`);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }

    // Check if bandit arms already exist
    const existingArms = await prisma.banditArm.findMany({
      where: { productId }
    });

    if (existingArms.length === 0) {
      // Initialize bandit arms
      console.log('Initializing bandit arms...');
      await banditSystem.initializeBanditArms(productId);
    } else {
      console.log(`Bandit arms already exist for product: ${productId}`);
    }

    // Create sample order history if none exists
    const existingHistory = await prisma.orderHistory.findFirst({
      where: { productId }
    });

    if (!existingHistory) {
      console.log('Creating sample order history...');
      // Create sample data for new products
      const sampleData = generateSampleOrderHistory(productId);
      await prisma.orderHistory.createMany({
        data: sampleData
      });
    }

    console.log('ML system initialization completed successfully');
    res.json({ 
      success: true, 
      message: 'ML system initialized successfully' 
    });
  } catch (error) {
    console.error('Initialization error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to initialize ML system',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate sample order history for new products
function generateSampleOrderHistory(productId: string) {
  const sampleData = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 90); // Start 90 days ago

  for (let i = 0; i < 12; i++) {
    const orderDate = new Date(baseDate);
    orderDate.setDate(orderDate.getDate() + i * 7); // Weekly orders

    const baseDemand = 100 + Math.random() * 50; // Random demand between 100-150
    const seasonalAdjustment = 1 + 0.2 * Math.sin((i / 12) * 2 * Math.PI); // Seasonal pattern
    const actualDemand = Math.round(baseDemand * seasonalAdjustment);

    sampleData.push({
      productId,
      orderDate,
      orderQuantity: Math.round(actualDemand * (0.8 + Math.random() * 0.4)), // Some prediction error
      actualDemand,
      leadTime: 14,
      cost: actualDemand * 2.5,
      revenue: actualDemand * 4.0,
      profit: actualDemand * 1.5,
      seasonality: getSeasonFromDate(orderDate),
      externalFactors: {}
    });
  }

  return sampleData;
}

function getSeasonFromDate(date: Date): string {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

// Test endpoint to manually update a bandit arm
router.post('/test-update-arm/:armId', async (req, res) => {
  try {
    const { armId } = req.params;
    const { reward } = req.body;

    console.log(`Testing update for arm ${armId} with reward ${reward}`);
    
    await banditSystem.updateArmReward(armId, reward);
    
    // Get updated arm
    const updatedArm = await prisma.banditArm.findUnique({
      where: { id: armId }
    });

    res.json({ 
      success: true, 
      message: 'Arm updated successfully',
      arm: updatedArm
    });
  } catch (error) {
    console.error('Test update error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to test update',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 