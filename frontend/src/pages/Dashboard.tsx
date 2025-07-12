import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Calendar,
  MapPin,
  Clock,
  Megaphone,
  Truck,
  BarChart3,
  Loader2,
  Download,
  Upload,
  Settings,
  XCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { apiService, Analytics, Alert } from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [analyticsData, alertsData] = await Promise.all([
          apiService.getAnalytics(),
          apiService.getAlerts()
        ]);
        
        setAnalytics(analyticsData);
        setRecentAlerts(alertsData.slice(0, 5)); // Get first 5 alerts
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Mock data for charts (since we don't have time-series data in the API yet)
  const expiryData = [
    { name: 'This Week', value: 45 },
    { name: 'Next Week', value: 78 },
    { name: '2 Weeks', value: 120 },
    { name: '3 Weeks', value: 89 },
    { name: '4 Weeks', value: 156 },
  ];

  const categoryData = [
    { name: 'FMCG', value: 35, color: '#0ea5e9' },
    { name: 'Pharmaceuticals', value: 25, color: '#ef4444' },
    { name: 'Cosmetics', value: 20, color: '#d946ef' },
    { name: 'Food Items', value: 20, color: '#f59e0b' },
  ];

  const stats = [
    {
      name: 'Total Products',
      value: analytics?.totalProducts?.toString() || '0',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Package
    },
    {
      name: 'Active Alerts',
      value: analytics?.activeAlerts?.toString() || '0',
      change: '+8%',
      changeType: 'negative' as const,
      icon: AlertTriangle
    },
    {
      name: 'Total Inventory',
      value: analytics?.totalInventoryItems?.toString() || '0',
      change: '+23%',
      changeType: 'positive' as const,
      icon: DollarSign
    },
    {
      name: 'Expiring Soon',
      value: analytics?.expiringItems?.toString() || '0',
      change: '+5',
      changeType: 'negative' as const,
      icon: TrendingUp
    }
  ];

  // Button handlers
  const handleViewAllAlerts = () => {
    navigate('/alerts');
  };

  const handleTakeAction = (alertId: string) => {
    // Mark alert as resolved
    apiService.updateAlert(alertId, { isResolved: true })
      .then(() => {
        // Refresh alerts
        apiService.getAlerts().then(alerts => {
          setRecentAlerts(alerts.slice(0, 5));
        });
      })
      .catch(err => {
        console.error('Failed to update alert:', err);
        alert('Failed to mark alert as resolved');
      });
  };

  const handleUploadInventory = () => {
    setShowUploadModal(true);
  };

  const handleCreatePromotion = () => {
    navigate('/promotions');
  };

  const handleSchedulePickup = () => {
    navigate('/pickup');
  };

  const handleViewReports = () => {
    navigate('/analytics');
  };

  const handleExportData = () => {
    // Create CSV data
    const csvData = [
      ['Product', 'Category', 'Quantity', 'Expiry Date', 'Status'],
      ['Organic Milk', 'Dairy', '150', '2024-01-15', 'Expired'],
      ['Vitamin C Tablets', 'Pharmaceuticals', '75', '2024-01-18', 'Warning'],
      ['Face Cream', 'Cosmetics', '200', '2024-01-20', 'Warning'],
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      ['Product Name', 'Category', 'SKU', 'Quantity', 'Expiry Date', 'Warehouse', 'Unit Price'],
      ['Sample Product', 'FMCG', 'SAMPLE001', '100', '2024-12-31', 'Warehouse A', '10.50'],
    ];
    
    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Monitor your warehouse inventory and expiry management</p>
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
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Expiry Timeline Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Expiry Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expiryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
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
      </div>

      {/* Recent Alerts */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
          <button 
            onClick={handleViewAllAlerts}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View all
          </button>
        </div>
        <div className="space-y-4">
          {recentAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No alerts at the moment</p>
            </div>
          ) : (
            recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{alert.product.name}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {alert.inventoryItem?.location || 'N/A'}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        {alert.inventoryItem?.quantity || 0} units
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.severity === 'CRITICAL' ? 'status-expired' : 'status-warning'
                  }`}>
                    {alert.severity}
                  </span>
                  <button 
                    onClick={() => handleTakeAction(alert.id)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Take Action
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button 
            onClick={handleUploadInventory}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <Upload className="h-6 w-6 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Upload Inventory</span>
          </button>
          <button 
            onClick={handleCreatePromotion}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <Megaphone className="h-6 w-6 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Create Promotion</span>
          </button>
          <button 
            onClick={handleSchedulePickup}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <Truck className="h-6 w-6 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Schedule Pickup</span>
          </button>
          <button 
            onClick={handleViewReports}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <BarChart3 className="h-6 w-6 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">View Reports</span>
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Upload Inventory</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Drag and drop your CSV file here, or{' '}
                  <button className="text-primary-600 hover:text-primary-700 font-medium">
                    browse
                  </button>
                </p>
                <button 
                  onClick={handleDownloadTemplate}
                  className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Download Template
                </button>
              </div>
            </div>
            <div className="mt-4 flex space-x-3">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert('Upload functionality would be implemented here');
                  setShowUploadModal(false);
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 