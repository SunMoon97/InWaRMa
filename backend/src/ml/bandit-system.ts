import { PrismaClient } from '@prisma/client';
import PolynomialRegression from 'ml-regression-polynomial';
import { Matrix } from 'ml-matrix';
import * as ss from 'simple-statistics';

export interface BanditArm {
  id: string;
  armType: string;
  parameters: any;
  rewardHistory: number[];
  pullCount: number;
  totalReward: number;
  averageReward: number;
  explorationRate: number;
}

export interface OrderPrediction {
  predictedQuantity: number;
  predictedOrderDate: Date;
  confidence: number;
  algorithm: string;
  features: any;
}

export interface DemandData {
  date: Date;
  demand: number;
  seasonality?: string;
  externalFactors?: any;
}

export class MultiArmedBanditSystem {
  private prisma: PrismaClient;
  private explorationRate: number = 0.1;
  private learningRate: number = 0.01;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Initialize bandit arms for a product
   */
  async initializeBanditArms(productId: string): Promise<void> {
    const armTypes = ['conservative', 'aggressive', 'balanced', 'seasonal'];
    
    for (const armType of armTypes) {
      const parameters = this.getArmParameters(armType);
      
      await this.prisma.banditArm.create({
        data: {
          productId,
          armType,
          parameters,
          rewardHistory: [],
          pullCount: 0,
          totalReward: 0,
          averageReward: 0,
          explorationRate: this.explorationRate
        }
      });
    }
  }

  /**
   * Get parameters for different arm types
   */
  private getArmParameters(armType: string): any {
    switch (armType) {
      case 'conservative':
        return {
          safetyStock: 0.2,
          reorderPoint: 0.3,
          leadTimeBuffer: 1.5,
          demandMultiplier: 0.8
        };
      case 'aggressive':
        return {
          safetyStock: 0.05,
          reorderPoint: 0.1,
          leadTimeBuffer: 1.0,
          demandMultiplier: 1.2
        };
      case 'balanced':
        return {
          safetyStock: 0.1,
          reorderPoint: 0.2,
          leadTimeBuffer: 1.2,
          demandMultiplier: 1.0
        };
      case 'seasonal':
        return {
          safetyStock: 0.15,
          reorderPoint: 0.25,
          leadTimeBuffer: 1.3,
          demandMultiplier: 1.1,
          seasonalAdjustment: true
        };
      default:
        return {};
    }
  }

  /**
   * Select the best arm using epsilon-greedy strategy
   */
  async selectArm(productId: string): Promise<BanditArm> {
    const arms = await this.prisma.banditArm.findMany({
      where: { productId }
    });

    if (arms.length === 0) {
      await this.initializeBanditArms(productId);
      return await this.selectArm(productId);
    }

    // Epsilon-greedy strategy
    if (Math.random() < this.explorationRate) {
      // Exploration: choose random arm
      const randomIndex = Math.floor(Math.random() * arms.length);
      return arms[randomIndex];
    } else {
      // Exploitation: choose best arm
      return arms.reduce((best, current) => 
        current.averageReward > best.averageReward ? current : best
      );
    }
  }

  /**
   * Update arm rewards after an order
   */
  async updateArmReward(armId: string, reward: number): Promise<void> {
    console.log(`Updating arm ${armId} with reward ${reward}`);
    
    const arm = await this.prisma.banditArm.findUnique({
      where: { id: armId }
    });

    if (!arm) {
      console.log(`Arm ${armId} not found`);
      return;
    }

    const safeReward = isNaN(reward) || !isFinite(reward) ? 0 : reward;
    const newPullCount = arm.pullCount + 1;
    const newTotalReward = arm.totalReward + safeReward;
    const newAverageReward = newTotalReward / newPullCount;
    const newRewardHistory = [...(arm.rewardHistory as number[]), safeReward];

    console.log(`Arm ${armId} stats before update:`, {
      pullCount: arm.pullCount,
      totalReward: arm.totalReward,
      averageReward: arm.averageReward
    });

    await this.prisma.banditArm.update({
      where: { id: armId },
      data: {
        pullCount: newPullCount,
        totalReward: newTotalReward,
        averageReward: newAverageReward,
        rewardHistory: newRewardHistory
      }
    });

    console.log(`Arm ${armId} stats after update:`, {
      pullCount: newPullCount,
      totalReward: newTotalReward,
      averageReward: newAverageReward
    });
  }

  /**
   * Calculate reward based on order performance
   */
  calculateReward(
    predictedDemand: number,
    actualDemand: number,
    orderCost: number,
    revenue: number,
    holdingCost: number
  ): number {
    if (!actualDemand || !revenue) return 0; // Prevent division by zero
    const demandAccuracy = 1 - Math.abs(predictedDemand - actualDemand) / actualDemand;
    const profitMargin = (revenue - orderCost - holdingCost) / revenue;
    
    // Reward is weighted combination of accuracy and profit
    const reward = 0.7 * demandAccuracy + 0.3 * profitMargin;
    if (isNaN(reward) || !isFinite(reward)) return 0;
    return reward;
  }
}

export class PolynomialRegressionPredictor {
  private prisma: PrismaClient;
  private degree: number = 3;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Train polynomial regression model on historical data
   */
  async trainModel(productId: string): Promise<PolynomialRegression> {
    const orderHistory = await this.prisma.orderHistory.findMany({
      where: { productId },
      orderBy: { orderDate: 'asc' }
    });

    if (orderHistory.length < this.degree + 1) {
      throw new Error('Insufficient data for polynomial regression');
    }

    // Prepare features and targets
    const features: number[][] = [];
    const targets: number[] = [];

    orderHistory.forEach((order, index) => {
      const timeFeature = index; // Time as feature
      const seasonalFeature = this.getSeasonalFeature(order.orderDate);
      const trendFeature = this.calculateTrend(orderHistory, index);
      
      features.push([timeFeature, seasonalFeature, trendFeature]);
      targets.push(order.actualDemand);
    });

    // Train polynomial regression
    const regression = new PolynomialRegression(features, targets, this.degree);
    return regression;
  }

  /**
   * Predict demand using polynomial regression
   */
  async predictDemand(
    productId: string,
    forecastDate: Date
  ): Promise<{ predictedDemand: number; confidence: number }> {
    try {
      const model = await this.trainModel(productId);
      const orderHistory = await this.prisma.orderHistory.findMany({
        where: { productId },
        orderBy: { orderDate: 'asc' }
      });

      const nextTimeStep = orderHistory.length;
      const seasonalFeature = this.getSeasonalFeature(forecastDate);
      const trendFeature = this.calculateTrend(orderHistory, nextTimeStep);
      
      const features = [nextTimeStep, seasonalFeature, trendFeature];
      const predictedDemand = model.predict(features);

      // Calculate confidence based on model fit
      const confidence = this.calculateConfidence(model, orderHistory);

      return {
        predictedDemand: Math.max(0, predictedDemand),
        confidence: Math.min(1, Math.max(0, confidence))
      };
    } catch (error) {
      // Fallback to simple moving average
      return this.fallbackPrediction(productId);
    }
  }

  /**
   * Calculate seasonal feature (0-1 based on season)
   */
  private getSeasonalFeature(date: Date): number {
    const month = date.getMonth();
    // Spring: 0.25, Summer: 0.5, Fall: 0.75, Winter: 0
    if (month >= 2 && month <= 4) return 0.25; // Spring
    if (month >= 5 && month <= 7) return 0.5;  // Summer
    if (month >= 8 && month <= 10) return 0.75; // Fall
    return 0; // Winter
  }

  /**
   * Calculate trend feature
   */
  private calculateTrend(orderHistory: any[], currentIndex: number): number {
    if (currentIndex < 3) return 0;
    
    const recentDemands = orderHistory
      .slice(-3)
      .map(order => order.actualDemand);
    
    const trend = ss.linearRegression(
      recentDemands.map((_, i) => [i, recentDemands[i]])
    );
    
    return trend.m; // Slope
  }

  /**
   * Calculate model confidence
   */
  private calculateConfidence(model: PolynomialRegression, data: any[]): number {
    const predictions = data.map((_, i) => model.predict([i]));
    const actuals = data.map(d => d.actualDemand);
    
    const mse = ss.meanSquaredError(actuals, predictions);
    const maxDemand = Math.max(...actuals);
    const normalizedMse = mse / (maxDemand * maxDemand);
    
    return Math.max(0, 1 - normalizedMse);
  }

  /**
   * Fallback prediction using simple moving average
   */
  private async fallbackPrediction(productId: string): Promise<{ predictedDemand: number; confidence: number }> {
    const orderHistory = await this.prisma.orderHistory.findMany({
      where: { productId },
      orderBy: { orderDate: 'desc' },
      take: 5
    });

    if (orderHistory.length === 0) {
      return { predictedDemand: 0, confidence: 0 };
    }

    const avgDemand = ss.mean(orderHistory.map(o => o.actualDemand));
    const confidence = 0.5; // Low confidence for fallback

    return { predictedDemand: avgDemand, confidence };
  }
}

export class HybridPredictor {
  private banditSystem: MultiArmedBanditSystem;
  private polynomialPredictor: PolynomialRegressionPredictor;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.banditSystem = new MultiArmedBanditSystem(prisma);
    this.polynomialPredictor = new PolynomialRegressionPredictor(prisma);
  }

  /**
   * Generate order prediction using hybrid approach
   */
  async predictOrder(
    productId: string,
    currentInventory: number,
    leadTime: number = 14
  ): Promise<OrderPrediction> {
    // Get polynomial regression prediction
    const forecastDate = new Date(Date.now() + leadTime * 24 * 60 * 60 * 1000);
    const polynomialPrediction = await this.polynomialPredictor.predictDemand(
      productId,
      forecastDate
    );

    // Get bandit arm recommendation
    const selectedArm = await this.banditSystem.selectArm(productId);
    const armParameters = selectedArm.parameters as any;

    // Combine predictions
    const baseDemand = polynomialPrediction.predictedDemand;
    const adjustedDemand = baseDemand * armParameters.demandMultiplier;
    
    // Calculate safety stock and reorder point
    const safetyStock = adjustedDemand * armParameters.safetyStock;
    const reorderPoint = adjustedDemand * armParameters.reorderPoint;
    
    // Determine order quantity
    const targetInventory = adjustedDemand + safetyStock;
    const orderQuantity = Math.max(0, targetInventory - currentInventory);

    // Calculate order date
    const orderDate = new Date(Date.now() + leadTime * armParameters.leadTimeBuffer * 24 * 60 * 60 * 1000);

    // Calculate confidence (weighted average)
    const banditConfidence = 0.8; // High confidence for bandit
    const hybridConfidence = (polynomialPrediction.confidence + banditConfidence) / 2;

    return {
      predictedQuantity: orderQuantity,
      predictedOrderDate: orderDate,
      confidence: hybridConfidence,
      algorithm: 'hybrid',
      features: {
        polynomialPrediction,
        banditArm: selectedArm.armType,
        banditArmId: selectedArm.id,
        armParameters,
        currentInventory,
        leadTime
      }
    };
  }

  /**
   * Update system after order completion
   */
  async updateAfterOrder(
    productId: string,
    armId: string,
    predictedDemand: number,
    actualDemand: number,
    orderCost: number,
    revenue: number,
    holdingCost: number
  ): Promise<void> {
    // Update bandit arm
    const reward = this.banditSystem.calculateReward(
      predictedDemand,
      actualDemand,
      orderCost,
      revenue,
      holdingCost
    );
    
    await this.banditSystem.updateArmReward(armId, reward);

    // Store order history
    await this.prisma.orderHistory.create({
      data: {
        productId,
        orderDate: new Date(),
        orderQuantity: predictedDemand,
        actualDemand,
        leadTime: 14,
        cost: orderCost,
        revenue,
        profit: revenue - orderCost - holdingCost,
        seasonality: this.getSeasonFromDate(new Date()),
        externalFactors: {}
      }
    });
  }

  /**
   * Get season from date
   */
  private getSeasonFromDate(date: Date): string {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }
} 