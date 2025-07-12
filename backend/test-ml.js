const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testMLSystem() {
  console.log('🧪 Testing ML System...\n');

  try {
    // 1. Get products
    console.log('1. Getting products...');
    const productsResponse = await fetch(`${BASE_URL}/products`);
    const products = await productsResponse.json();
    console.log(`Found ${products.length} products`);
    
    if (products.length === 0) {
      console.log('❌ No products found. Please seed the database first.');
      return;
    }

    const productId = products[0].id;
    console.log(`Using product: ${products[0].name} (${productId})\n`);

    // 2. Initialize ML system
    console.log('2. Initializing ML system...');
    const initResponse = await fetch(`${BASE_URL}/ml/initialize/${productId}`, {
      method: 'POST'
    });
    const initResult = await initResponse.json();
    console.log('Init result:', initResult);

    if (!initResult.success) {
      console.log('❌ Failed to initialize ML system');
      return;
    }

    // 3. Get bandit arms
    console.log('\n3. Getting bandit arms...');
    const armsResponse = await fetch(`${BASE_URL}/ml/bandit/${productId}`);
    const armsResult = await armsResponse.json();
    console.log('Arms result:', armsResult);

    if (armsResult.success) {
      console.log(`Found ${armsResult.arms.length} bandit arms:`);
      armsResult.arms.forEach((arm, index) => {
        console.log(`  ${index + 1}. ${arm.armType} - ${arm.pullCount} pulls, ${(arm.averageReward * 100).toFixed(1)}% avg reward`);
      });
    }

    // 4. Generate prediction
    console.log('\n4. Generating prediction...');
    const predictResponse = await fetch(`${BASE_URL}/ml/predict/${productId}`);
    const predictResult = await predictResponse.json();
    console.log('Prediction result:', predictResult);

    if (predictResult.success) {
      console.log(`Predicted quantity: ${predictResult.prediction.predictedQuantity}`);
      console.log(`Predicted order date: ${predictResult.prediction.predictedOrderDate}`);
      console.log(`Confidence: ${(predictResult.prediction.confidence * 100).toFixed(1)}%`);
    }

    // 5. Get analytics
    console.log('\n5. Getting analytics...');
    const analyticsResponse = await fetch(`${BASE_URL}/ml/analytics/${productId}`);
    const analyticsResult = await analyticsResponse.json();
    console.log('Analytics result:', analyticsResult);

    if (analyticsResult.success) {
      const analytics = analyticsResult.analytics;
      console.log(`Total orders: ${analytics.totalOrders}`);
      console.log(`Total predictions: ${analytics.totalPredictions}`);
      console.log(`Accuracy: ${(analytics.accuracy * 100).toFixed(1)}%`);
      console.log(`Avg confidence: ${(analytics.avgConfidence * 100).toFixed(1)}%`);
    }

    console.log('\n✅ ML System test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMLSystem(); 