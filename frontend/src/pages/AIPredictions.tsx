import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Calendar,
  Zap,
  Activity,
  Eye,
  RefreshCw,
  Play,
  Pause,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { apiService } from '../services/api';

interface BanditArm {
  id: string;
  armType: string;
  pullCount: number;
  averageReward: number;
  explorationRate: number;
}

interface OrderPrediction {
  id: string;
  predictedQuantity: number;
  predictedOrderDate: string;
  confidence: number;
  algorithm: string;
  features: any;
  createdAt: string;
}

interface MLAnalytics {
  totalOrders: number;
  totalPredictions: number;
  accuracy: number;
  avgConfidence: number;
  banditArms: BanditArm[];
  recentHistory: any[];
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  unit: string;
}

const AIPredictions: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [predictions, setPredictions] = useState<OrderPrediction[]>([]);
  const [analytics, setAnalytics] = useState<MLAnalytics | null>(null);
  const [banditArms, setBanditArms] = useState<BanditArm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<any>(null);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchMLData();
    }
  }, [selectedProduct]);

  const fetchProducts = async () => {
    try {
      const data = await apiService.getProducts();
      setProducts(data);
      if (data.length > 0) {
        setSelectedProduct(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchMLData = async () => {
    if (!selectedProduct) return;
    
    setIsLoading(true);
    try {
      console.log('Fetching ML data for product:', selectedProduct);
      
      const [analyticsData, armsData, predictionsData] = await Promise.all([
        apiService.get(`/ml/analytics/${selectedProduct}`),
        apiService.get(`/ml/bandit/${selectedProduct}`),
        apiService.get(`/ml/predictions/${selectedProduct}`)
      ]);

      console.log('Analytics data:', analyticsData);
      console.log('Arms data:', armsData);
      console.log('Predictions data:', predictionsData);

      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }
      if (armsData.success) {
        console.log('Setting bandit arms:', armsData.arms);
        setBanditArms(armsData.arms);
      }
      if (predictionsData.success) {
        setPredictions(predictionsData.predictions);
      }
    } catch (error) {
      console.error('Failed to fetch ML data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeMLSystem = async () => {
    if (!selectedProduct) return;
    
    setIsInitializing(true);
    try {
      await apiService.post(`/ml/initialize/${selectedProduct}`);
      await fetchMLData();
    } catch (error) {
      console.error('Failed to initialize ML system:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const generatePrediction = async () => {
    if (!selectedProduct) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.get(`/ml/predict/${selectedProduct}`);
      if (response.success) {
        setCurrentPrediction(response.prediction);
        setShowPredictionModal(true);
        await fetchMLData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to generate prediction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runSimulation = async () => {
    if (!selectedProduct) return;
    
    setIsLoading(true);
    const results = [];
    
    try {
      // Simulate 10 rounds of predictions and outcomes
      for (let i = 0; i < 10; i++) {
        // Generate prediction
        const predictResponse = await apiService.get(`/ml/predict/${selectedProduct}`);
        
        if (predictResponse.success) {
          const prediction = predictResponse.prediction;
          
          // Simulate actual outcome (with some randomness)
          const actualDemand = prediction.predictedQuantity * (0.8 + Math.random() * 0.4);
          const orderCost = prediction.predictedQuantity * 2.5;
          const revenue = actualDemand * 4.0;
          const holdingCost = Math.max(0, prediction.predictedQuantity - actualDemand) * 0.5;
          
          // Update the system with the outcome
          console.log('Updating with prediction:', prediction);
          await apiService.post('/ml/update-order', {
            productId: selectedProduct,
            armId: prediction.features?.banditArmId || 'unknown',
            predictedDemand: prediction.predictedQuantity,
            actualDemand,
            orderCost,
            revenue,
            holdingCost
          });
          
          results.push({
            round: i + 1,
            prediction: prediction.predictedQuantity,
            actual: Math.round(actualDemand),
            arm: prediction.features?.banditArm,
            accuracy: Math.round((1 - Math.abs(prediction.predictedQuantity - actualDemand) / actualDemand) * 100)
          });
        }
        
        // Small delay between rounds
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setSimulationResults(results);
      await fetchMLData(); // Refresh data to show updated bandit arms
      
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">High</span>;
    if (confidence >= 0.6) return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Medium</span>;
    return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Low</span>;
  };

  const getArmTypeColor = (armType: string) => {
    switch (armType) {
      case 'conservative': return 'bg-blue-100 text-blue-800';
      case 'aggressive': return 'bg-red-100 text-red-800';
      case 'balanced': return 'bg-green-100 text-green-800';
      case 'seasonal': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Brain className="mr-3 text-blue-600" />
                AI Inventory Predictions
              </h1>
              <p className="text-gray-600 mt-2">
                Multi-armed bandit system with polynomial regression for intelligent order prediction
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={initializeMLSystem}
                disabled={isInitializing}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
              >
                {isInitializing ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Settings className="mr-2 h-4 w-4" />
                )}
                {isInitializing ? 'Initializing...' : 'Initialize ML'}
              </button>
              <button
                onClick={generatePrediction}
                disabled={isLoading || !selectedProduct}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <Zap className="mr-2 h-4 w-4" />
                Generate Prediction
              </button>
              <button
                onClick={() => setShowSimulationModal(true)}
                disabled={isLoading || !selectedProduct}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                <Play className="mr-2 h-4 w-4" />
                Simulate Learning
              </button>
            </div>
          </div>
        </div>

        {/* Product Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Product
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.sku})
              </option>
            ))}
          </select>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {!isLoading && selectedProduct && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Analytics Overview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
                  ML System Analytics
                </h2>
                
                {analytics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analytics.totalOrders}</div>
                      <div className="text-sm text-gray-600">Total Orders</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analytics.totalPredictions}</div>
                      <div className="text-sm text-gray-600">Predictions</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {(analytics.accuracy * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {(analytics.avgConfidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Avg Confidence</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bandit Arms */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="mr-2 h-5 w-5 text-green-600" />
                  Multi-Armed Bandit
                </h3>
                
                <div className="space-y-3">
                  {banditArms.map((arm) => (
                    <div key={arm.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getArmTypeColor(arm.armType)}`}>
                          {arm.armType}
                        </span>
                        <span className="text-sm text-gray-500">
                          {arm.pullCount} pulls
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Avg Reward: <span className="font-medium">{(arm.averageReward * 100).toFixed(1)}%</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Exploration: <span className="font-medium">{(arm.explorationRate * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Predictions */}
        {!isLoading && predictions.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                Recent Predictions
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Algorithm
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {predictions.map((prediction) => (
                    <tr key={prediction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(prediction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {prediction.predictedQuantity.toFixed(0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(prediction.predictedOrderDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getConfidenceBadge(prediction.confidence)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {prediction.algorithm}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Prediction Modal */}
      {showPredictionModal && currentPrediction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Brain className="mr-2 h-5 w-5 text-blue-600" />
                AI Prediction
              </h3>
              <button
                onClick={() => setShowPredictionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {currentPrediction.predictedQuantity.toFixed(0)} units
                </div>
                <div className="text-sm text-blue-600">Recommended Order Quantity</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-lg font-semibold text-green-600">
                  {new Date(currentPrediction.predictedOrderDate).toLocaleDateString()}
                </div>
                <div className="text-sm text-green-600">Recommended Order Date</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-lg font-semibold text-purple-600">
                  {(currentPrediction.confidence * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-purple-600">Confidence Level</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">
                  <strong>Algorithm:</strong> {currentPrediction.algorithm}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Bandit Arm:</strong> {currentPrediction.features?.banditArm}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowPredictionModal(false)}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Here you would implement the order placement logic
                  alert('Order placement feature would be implemented here');
                  setShowPredictionModal(false);
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Modal */}
      {showSimulationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Play className="mr-2 h-5 w-5 text-green-600" />
                Bandit Learning Simulation
              </h3>
              <button
                onClick={() => setShowSimulationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                This simulation will run 10 rounds of predictions and outcomes to demonstrate how the multi-armed bandit learns and adapts.
              </p>
              <button
                onClick={runSimulation}
                disabled={isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Running Simulation...' : 'Start Simulation'}
              </button>
            </div>

            {simulationResults.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Simulation Results:</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Round</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Arm Used</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Predicted</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actual</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {simulationResults.map((result) => (
                        <tr key={result.round} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{result.round}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getArmTypeColor(result.arm)}`}>
                              {result.arm}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{result.prediction.toFixed(0)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{result.actual}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              result.accuracy >= 80 ? 'bg-green-100 text-green-800' :
                              result.accuracy >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {result.accuracy}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> After running the simulation, check the Multi-Armed Bandit section above to see how the arms' performance metrics have updated!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPredictions; 