import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  MapPin,
  Package,
  DollarSign,
  AlertTriangle,
  Download,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';

const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Mock analytics data
  const expiryTrendData = [
    { date: 'Jan 1', expired: 12, warning: 45, safe: 120 },
    { date: 'Jan 8', expired: 18, warning: 52, safe: 115 },
    { date: 'Jan 15', expired: 25, warning: 78, safe: 98 },
    { date: 'Jan 22', expired: 15, warning: 65, safe: 110 },
    { date: 'Jan 29', expired: 22, warning: 89, safe: 95 },
  ];

  const warehouseData = [
    { name: 'Warehouse A', expired: 45, warning: 120, safe: 300 },
    { name: 'Warehouse B', expired: 32, warning: 89, safe: 250 },
    { name: 'Warehouse C', expired: 28, warning: 67, safe: 180 },
    { name: 'Warehouse D', expired: 15, warning: 45, safe: 120 },
  ];

  const categoryData = [
    { name: 'FMCG', value: 35, color: '#0ea5e9' },
    { name: 'Pharmaceuticals', value: 25, color: '#ef4444' },
    { name: 'Cosmetics', value: 20, color: '#d946ef' },
    { name: 'Food Items', value: 20, color: '#f59e0b' },
  ];

  const revenueData = [
    { month: 'Jan', saved: 4500, lost: 1200 },
    { month: 'Feb', saved: 5200, lost: 800 },
    { month: 'Mar', saved: 4800, lost: 1500 },
    { month: 'Apr', saved: 6100, lost: 900 },
    { month: 'May', saved: 5500, lost: 1100 },
    { month: 'Jun', saved: 6800, lost: 700 },
  ];

  const stats = [
    {
      name: 'Total Items',
      value: '12,450',
      change: '+12%',
      changeType: 'positive',
      icon: Package
    },
    {
      name: 'Near Expiry',
      value: '342',
      change: '+8%',
      changeType: 'negative',
      icon: AlertTriangle
    },
    {
      name: 'Revenue Saved',
      value: '$45,230',
      change: '+23%',
      changeType: 'positive',
      icon: DollarSign
    },
    {
      name: 'Waste Reduced',
      value: '67%',
      change: '+15%',
      changeType: 'positive',
      icon: TrendingUp
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your warehouse expiry management</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-field"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="btn-secondary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                  <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-success-600' : 'text-danger-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">from last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Expiry Trend */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Expiry Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={expiryTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="safe" stackId="1" stroke="#22c55e" fill="#22c55e" />
              <Area type="monotone" dataKey="warning" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
              <Area type="monotone" dataKey="expired" stackId="1" stroke="#ef4444" fill="#ef4444" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Impact */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Impact</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="saved" stroke="#22c55e" strokeWidth={2} />
              <Line type="monotone" dataKey="lost" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Warehouse Heatmap */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Warehouse Expiry Heatmap</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={warehouseData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="safe" stackId="a" fill="#22c55e" />
            <Bar dataKey="warning" stackId="a" fill="#f59e0b" />
            <Bar dataKey="expired" stackId="a" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Key Metrics */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Average Time to Expiry</p>
                <p className="text-sm text-gray-500">Time remaining before items expire</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary-600">12.5 days</p>
                <p className="text-xs text-success-600">+2.3 days</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Clearance Success Rate</p>
                <p className="text-sm text-gray-500">Items sold before expiry</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-success-600">78%</p>
                <p className="text-xs text-success-600">+5.2%</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Waste Reduction</p>
                <p className="text-sm text-gray-500">Reduction in expired inventory</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-success-600">67%</p>
                <p className="text-xs text-success-600">+12.1%</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Cost Savings</p>
                <p className="text-sm text-gray-500">Total savings from prevention</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-success-600">$45,230</p>
                <p className="text-xs text-success-600">+23.4%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">AI Recommendations</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="p-4 border border-warning-200 bg-warning-50 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-warning-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-warning-900">High Expiry Risk</h4>
                <p className="text-sm text-warning-700 mt-1">
                  Warehouse A has 45 items expiring this week. Consider creating targeted promotions.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border border-success-200 bg-success-50 rounded-lg">
            <div className="flex items-start">
              <TrendingUp className="h-5 w-5 text-success-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-success-900">Optimization Opportunity</h4>
                <p className="text-sm text-success-700 mt-1">
                  Pharmaceutical category shows 25% improvement in clearance rate.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border border-primary-200 bg-primary-50 rounded-lg">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-primary-900">Geographic Insight</h4>
                <p className="text-sm text-primary-700 mt-1">
                  Downtown area shows highest conversion rate for dairy products.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border border-secondary-200 bg-secondary-50 rounded-lg">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-secondary-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-secondary-900">Seasonal Pattern</h4>
                <p className="text-sm text-secondary-700 mt-1">
                  Cosmetics expiry peaks in Q1. Plan inventory accordingly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 