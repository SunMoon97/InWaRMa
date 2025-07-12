import React, { useState } from 'react';
import { 
  Megaphone, 
  MapPin, 
  Users, 
  DollarSign,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Eye,
  Target,
  TrendingUp
} from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  targetLocation: string;
  radius: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'draft' | 'expired';
  products: string[];
  views: number;
  conversions: number;
}

const Promotions: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock promotions data
  const promotions: Promotion[] = [
    {
      id: '1',
      title: 'Organic Milk Clearance',
      description: '50% off on organic milk products expiring this week',
      discount: 50,
      targetLocation: 'Downtown Area',
      radius: 5,
      startDate: '2024-01-15',
      endDate: '2024-01-22',
      status: 'active',
      products: ['Organic Milk', 'Yogurt', 'Cheese'],
      views: 1250,
      conversions: 89
    },
    {
      id: '2',
      title: 'Vitamin C Flash Sale',
      description: '30% off on vitamin supplements near expiry',
      discount: 30,
      targetLocation: 'Medical District',
      radius: 3,
      startDate: '2024-01-18',
      endDate: '2024-01-25',
      status: 'active',
      products: ['Vitamin C Tablets', 'Multivitamins'],
      views: 890,
      conversions: 67
    },
    {
      id: '3',
      title: 'Cosmetics Clearance',
      description: '40% off on beauty products expiring soon',
      discount: 40,
      targetLocation: 'Shopping Mall Area',
      radius: 8,
      startDate: '2024-01-20',
      endDate: '2024-01-27',
      status: 'draft',
      products: ['Face Cream', 'Shampoo', 'Conditioner'],
      views: 0,
      conversions: 0
    }
  ];

  const filteredPromotions = promotions.filter(promotion => 
    selectedStatus === 'all' || promotion.status === selectedStatus
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="status-safe">Active</span>;
      case 'draft':
        return <span className="status-warning">Draft</span>;
      case 'expired':
        return <span className="status-expired">Expired</span>;
      default:
        return null;
    }
  };

  const getConversionRate = (views: number, conversions: number) => {
    if (views === 0) return 0;
    return ((conversions / views) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
          <p className="text-gray-600">Create and manage geo-targeted promotions for near-expiry inventory</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create Promotion
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Megaphone className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Promotions</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {promotions.filter(p => p.status === 'active').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-secondary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Views</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {promotions.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Conversions</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {promotions.reduce((sum, p) => sum + p.conversions, 0)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Revenue Saved</dt>
                <dd className="text-lg font-medium text-gray-900">$12,450</dd>
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
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredPromotions.map((promotion) => (
          <div key={promotion.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{promotion.title}</h3>
                  {getStatusBadge(promotion.status)}
                </div>
                <p className="text-sm text-gray-600 mb-3">{promotion.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Discount:</span>
                    <span className="ml-2 font-medium text-success-600">{promotion.discount}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-2 font-medium">{promotion.targetLocation}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Radius:</span>
                    <span className="ml-2 font-medium">{promotion.radius} km</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-2 font-medium">
                      {promotion.startDate} - {promotion.endDate}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="text-primary-600 hover:text-primary-700">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="text-gray-600 hover:text-gray-900">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-danger-600 hover:text-danger-900">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-500">Products:</span>
                  <span className="ml-2 font-medium">{promotion.products.length} items</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{promotion.views}</div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{promotion.conversions}</div>
                    <div className="text-xs text-gray-500">Conversions</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-success-600">
                      {getConversionRate(promotion.views, promotion.conversions)}%
                    </div>
                    <div className="text-xs text-gray-500">Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPromotions.length === 0 && (
        <div className="card text-center py-12">
          <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No promotions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedStatus !== 'all' 
              ? 'No promotions match the selected status.'
              : 'Get started by creating your first promotion.'
            }
          </p>
          <div className="mt-6">
            <button className="btn-primary flex items-center mx-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Promotion
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions; 