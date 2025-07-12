import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  XCircle, 
  CheckCircle,
  Clock,
  MapPin,
  Package,
  Filter,
  Search,
  Settings,
  X,
  Eye,
  Trash2
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  product: string;
  warehouse: string;
  expiryDate: string;
  quantity: number;
  timestamp: string;
  isRead: boolean;
}

const Alerts: React.FC = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Mock alerts data
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'critical',
      title: 'Critical: Organic Milk Expired',
      message: '150 units of Organic Milk have expired and need immediate attention.',
      product: 'Organic Milk',
      warehouse: 'Warehouse A',
      expiryDate: '2024-01-15',
      quantity: 150,
      timestamp: '2024-01-15T10:30:00Z',
      isRead: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'Warning: Vitamin C Tablets Expiring Soon',
      message: '75 units of Vitamin C Tablets will expire in 3 days.',
      product: 'Vitamin C Tablets',
      warehouse: 'Warehouse B',
      expiryDate: '2024-01-18',
      quantity: 75,
      timestamp: '2024-01-15T09:15:00Z',
      isRead: false
    },
    {
      id: '3',
      type: 'warning',
      title: 'Warning: Face Cream Expiring Soon',
      message: '200 units of Face Cream will expire in 5 days.',
      product: 'Face Cream',
      warehouse: 'Warehouse C',
      expiryDate: '2024-01-20',
      quantity: 200,
      timestamp: '2024-01-15T08:45:00Z',
      isRead: true
    },
    {
      id: '4',
      type: 'info',
      title: 'Info: New Inventory Uploaded',
      message: 'New inventory data has been uploaded successfully.',
      product: 'N/A',
      warehouse: 'All Warehouses',
      expiryDate: 'N/A',
      quantity: 0,
      timestamp: '2024-01-15T07:30:00Z',
      isRead: true
    }
  ]);

  const filteredAlerts = alerts.filter(alert => {
    const matchesType = selectedType === 'all' || alert.type === selectedType;
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.product.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-danger-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning-500" />;
      case 'info':
        return <Bell className="h-5 w-5 text-primary-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'critical':
        return <span className="status-expired">Critical</span>;
      case 'warning':
        return <span className="status-warning">Warning</span>;
      case 'info':
        return <span className="status-safe">Info</span>;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Button handlers
  const handleMarkAllRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));
  };

  const handleMarkAsRead = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const handleViewAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowAlertDetails(true);
  };

  const handleDeleteAlert = (alertId: string) => {
    if (confirm('Are you sure you want to delete this alert?')) {
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    }
  };

  const handleTakeAction = (alert: Alert) => {
    alert(`Taking action for: ${alert.title}\nThis would typically open a form to resolve the alert.`);
    // Mark as read when action is taken
    handleMarkAsRead(alert.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="text-gray-600">Monitor and manage expiry alerts</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            onClick={handleMarkAllRead}
            className="btn-secondary flex items-center"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </button>
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="btn-primary flex items-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Bell className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Alerts</dt>
                <dd className="text-lg font-medium text-gray-900">{alerts.length}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-danger-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Critical</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {alerts.filter(a => a.type === 'critical').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Warnings</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {alerts.filter(a => a.type === 'warning').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Unread</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {alerts.filter(a => !a.isRead).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input-field"
            >
              <option value="all">All Types</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
          <span className="text-sm text-gray-500">{filteredAlerts.length} alerts</span>
        </div>
        
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-lg border ${
                  alert.isRead ? 'bg-gray-50 border-gray-200' : 'bg-white border-primary-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className={`text-sm font-medium ${
                          alert.isRead ? 'text-gray-900' : 'text-gray-900'
                        }`}>
                          {alert.title}
                        </h4>
                        {!alert.isRead && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Package className="h-3 w-3 mr-1" />
                          {alert.product}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {alert.warehouse}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimestamp(alert.timestamp)}
                        </span>
                        {alert.quantity > 0 && (
                          <span className="flex items-center">
                            <Package className="h-3 w-3 mr-1" />
                            {alert.quantity} units
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getAlertBadge(alert.type)}
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => handleViewAlert(alert)}
                        className="text-primary-600 hover:text-primary-900 p-1"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {!alert.isRead && (
                        <button 
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="text-success-600 hover:text-success-900 p-1"
                          title="Mark as Read"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleTakeAction(alert)}
                        className="text-primary-600 hover:text-primary-900 p-1"
                        title="Take Action"
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="text-danger-600 hover:text-danger-900 p-1"
                        title="Delete Alert"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Alert Settings</h3>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notification Preferences</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700">Email notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700">Push notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700">SMS notifications</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alert Thresholds</label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600">Days before expiry (Warning)</label>
                    <input type="number" defaultValue={7} className="input-field w-full" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">Days before expiry (Critical)</label>
                    <input type="number" defaultValue={3} className="input-field w-full" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex space-x-3">
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert('Settings saved successfully!');
                  setShowSettingsModal(false);
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Details Modal */}
      {showAlertDetails && selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getAlertIcon(selectedAlert.type)}
                <h3 className="text-lg font-medium text-gray-900">{selectedAlert.title}</h3>
              </div>
              <button 
                onClick={() => setShowAlertDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">{selectedAlert.message}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Product:</span>
                  <p className="text-gray-600">{selectedAlert.product}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Warehouse:</span>
                  <p className="text-gray-600">{selectedAlert.warehouse}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Expiry Date:</span>
                  <p className="text-gray-600">{selectedAlert.expiryDate}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Quantity:</span>
                  <p className="text-gray-600">{selectedAlert.quantity} units</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <p className="text-gray-600">{formatTimestamp(selectedAlert.timestamp)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <p className="text-gray-600">{selectedAlert.isRead ? 'Read' : 'Unread'}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex space-x-3">
              <button 
                onClick={() => setShowAlertDetails(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  handleTakeAction(selectedAlert);
                  setShowAlertDetails(false);
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Take Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts; 