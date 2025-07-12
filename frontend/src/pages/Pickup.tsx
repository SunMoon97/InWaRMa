import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Package,
  Phone,
  Mail,
  Calendar,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface PickupRequest {
  id: string;
  product: string;
  quantity: number;
  warehouse: string;
  pickupDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  partner: string;
  contact: string;
  phone: string;
  email: string;
  notes: string;
}

const Pickup: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock pickup data
  const pickupRequests: PickupRequest[] = [
    {
      id: '1',
      product: 'Organic Milk',
      quantity: 150,
      warehouse: 'Warehouse A',
      pickupDate: '2024-01-16',
      status: 'confirmed',
      partner: 'Local Grocery Store',
      contact: 'John Smith',
      phone: '+1 (555) 123-4567',
      email: 'john@localgrocery.com',
      notes: 'Urgent pickup needed for dairy products'
    },
    {
      id: '2',
      product: 'Vitamin C Tablets',
      quantity: 75,
      warehouse: 'Warehouse B',
      pickupDate: '2024-01-19',
      status: 'pending',
      partner: 'Pharmacy Chain',
      contact: 'Sarah Johnson',
      phone: '+1 (555) 987-6543',
      email: 'sarah@pharmacy.com',
      notes: 'Standard pickup for pharmaceutical items'
    },
    {
      id: '3',
      product: 'Face Cream',
      quantity: 200,
      warehouse: 'Warehouse C',
      pickupDate: '2024-01-21',
      status: 'completed',
      partner: 'Beauty Supply Store',
      contact: 'Mike Wilson',
      phone: '+1 (555) 456-7890',
      email: 'mike@beautysupply.com',
      notes: 'Cosmetics pickup completed successfully'
    }
  ];

  const filteredRequests = pickupRequests.filter(request => 
    selectedStatus === 'all' || request.status === selectedStatus
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="status-warning">Pending</span>;
      case 'confirmed':
        return <span className="status-safe">Confirmed</span>;
      case 'completed':
        return <span className="status-safe">Completed</span>;
      case 'cancelled':
        return <span className="status-expired">Cancelled</span>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-warning-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-danger-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pickup Coordination</h1>
          <p className="text-gray-600">Manage logistics and pickup requests for near-expiry inventory</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Pickup
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Truck className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Pickups</dt>
                <dd className="text-lg font-medium text-gray-900">{pickupRequests.length}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {pickupRequests.filter(p => p.status === 'pending').length}
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
                <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {pickupRequests.filter(p => p.status === 'completed').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-secondary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Items Cleared</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {pickupRequests.reduce((sum, p) => sum + p.quantity, 0)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pickup Requests */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Pickup Requests</h3>
          <span className="text-sm text-gray-500">{filteredRequests.length} requests</span>
        </div>
        
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{request.product}</h4>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Quantity:</span>
                      <span className="ml-2 font-medium">{request.quantity} units</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Warehouse:</span>
                      <span className="ml-2 font-medium">{request.warehouse}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Pickup Date:</span>
                      <span className="ml-2 font-medium">{request.pickupDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Partner:</span>
                      <span className="ml-2 font-medium">{request.partner}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {request.phone}
                    </span>
                    <span className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {request.email}
                    </span>
                  </div>
                  
                  {request.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{request.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {getStatusIcon(request.status)}
                  <div className="flex items-center space-x-1">
                    <button className="text-primary-600 hover:text-primary-700">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-danger-600 hover:text-danger-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-8">
            <Truck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pickup requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedStatus !== 'all' 
                ? 'No requests match the selected status.'
                : 'Get started by scheduling your first pickup.'
              }
            </p>
            <div className="mt-6">
              <button className="btn-primary flex items-center mx-auto">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Pickup
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <Truck className="h-6 w-6 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Schedule Pickup</span>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <MapPin className="h-6 w-6 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Find Partners</span>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <Calendar className="h-6 w-6 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">View Calendar</span>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <Package className="h-6 w-6 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Track Shipments</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pickup; 