import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  XCircle,
  Save,
  AlertTriangle
} from 'lucide-react';
import { apiService } from '../services/api';

interface InventoryItem {
  id: string;
  productId: string;
  batchNumber?: string;
  quantity: number;
  unitPrice: number;
  expiryDate: string;
  location: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DISPOSED' | 'RESERVED';
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
    category: string;
    description?: string;
    unit: string;
  };
}

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([
    {
      id: '1',
      productId: '1',
      batchNumber: 'MILK-001-B001',
      quantity: 150,
      unitPrice: 2.50,
      expiryDate: '2024-02-15',
      location: 'Warehouse A',
      status: 'ACTIVE',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      product: {
        id: '1',
        name: 'Organic Milk',
        sku: 'MILK001',
        category: 'Dairy',
        description: 'Fresh organic whole milk',
        unit: 'L'
      }
    },
    {
      id: '2',
      productId: '2',
      batchNumber: 'YOG-002-B001',
      quantity: 75,
      unitPrice: 3.00,
      expiryDate: '2024-02-10',
      location: 'Warehouse A',
      status: 'ACTIVE',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      product: {
        id: '2',
        name: 'Greek Yogurt',
        sku: 'YOG001',
        category: 'Dairy',
        description: 'Natural Greek yogurt',
        unit: 'L'
      }
    },
    {
      id: '3',
      productId: '3',
      batchNumber: 'MED-003-B001',
      quantity: 200,
      unitPrice: 5.00,
      expiryDate: '2025-12-31',
      location: 'Warehouse B',
      status: 'ACTIVE',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      product: {
        id: '3',
        name: 'Aspirin 500mg',
        sku: 'ASP001',
        category: 'Pharmaceuticals',
        description: 'Pain relief tablets',
        unit: 'box'
      }
    }
  ]);

  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
    productName: '',
    category: '',
    sku: '',
    quantity: 0,
    expiryDate: '',
    warehouse: '',
    status: 'safe',
    value: 0
  });

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['all', 'Dairy', 'Pharmaceuticals', 'Cosmetics', 'Food', 'Personal Care'];
  const statuses = ['all', 'safe', 'warning', 'expired'];

  const filteredData = (inventoryData || []).filter(item => {
    const matchesSearch = (item.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.product?.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.product?.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'expired':
        return <span className="status-expired">Expired</span>;
      case 'warning':
        return <span className="status-warning">Warning</span>;
      case 'safe':
        return <span className="status-safe">Safe</span>;
      default:
        return null;
    }
  };

  const fetchInventory = async () => {
    try {
      const data = await apiService.getInventory();
      setInventoryData(data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      alert('Failed to load inventory data.');
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Button handlers
  const handleExport = () => {
    const csvData = [
      ['Product Name', 'Category', 'SKU', 'Quantity', 'Expiry Date', 'Warehouse', 'Status', 'Value'],
      ...filteredData.map(item => [
        item.productName,
        item.category,
        item.sku,
        item.quantity.toString(),
        item.expiryDate,
        item.warehouse,
        item.status,
        `$${item.value}`
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAddItem = () => {
    setShowAddModal(true);
    setNewItem({
      productName: '',
      category: '',
      sku: '',
      quantity: 0,
      expiryDate: '',
      warehouse: '',
      status: 'safe',
      value: 0
    });
  };

  const handleSaveItem = () => {
    if (showAddModal) {
      const newId = (inventoryData.length + 1).toString();
      setInventoryData([...inventoryData, { ...newItem, id: newId }]);
      setShowAddModal(false);
    } else if (showEditModal && selectedItem) {
      setInventoryData(inventoryData.map(item => 
        item.id === selectedItem.id ? { ...newItem, id: selectedItem.id } : item
      ));
      setShowEditModal(false);
      setSelectedItem(null);
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewItem(item);
    setShowEditModal(true);
  };

  const handleDeleteItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedItem) {
      setInventoryData(inventoryData.filter(item => item.id !== selectedItem.id));
      setShowDeleteModal(false);
      setSelectedItem(null);
    }
  };

  const handleViewItem = (item: InventoryItem) => {
    alert(`Viewing details for ${item.productName}\nSKU: ${item.sku}\nQuantity: ${item.quantity}\nExpiry: ${item.expiryDate}\nWarehouse: ${item.warehouse}\nValue: $${item.value}`);
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

  const handleUploadInventory = () => {
    setShowUploadModal(true);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    try {
      const response = await apiService.uploadCSV(file);
      alert(`Successfully uploaded ${response.count} items from CSV`);
      fetchInventory(); // Refresh the inventory list
    } catch (error) {
      alert('Failed to upload CSV file. Please check the file format.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,sku,category,description,unit,batchNumber,quantity,unitPrice,expiryDate,location
Milk,MLK001,Dairy,Fresh whole milk,L,MLK001-B001,100,2.50,2024-02-15,Warehouse A
Yogurt,YOG001,Dairy,Natural yogurt,L,YOG001-B001,50,3.00,2024-02-10,Warehouse A
Aspirin,ASP001,Pharmaceuticals,Pain relief tablets,box,ASP001-B001,200,5.00,2025-12-31,Warehouse B
Shampoo,SHP001,Personal Care,Hair care shampoo,bottle,SHP001-B001,75,8.50,2024-06-30,Warehouse C`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <div className="flex gap-3">
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Download Template
          </button>
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Upload CSV'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add Item
          </button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv"
        style={{ display: 'none' }}
      />

      {/* Upload Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Upload Inventory</h3>
          <button 
            onClick={handleDownloadTemplate}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Download Template
          </button>
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Drag and drop your CSV file here, or{' '}
              <button 
                onClick={handleUploadInventory}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports CSV files with columns: Product Name, Category, SKU, Quantity, Expiry Date, Warehouse
            </p>
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
                placeholder="Search products or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Inventory Items</h3>
          <span className="text-sm text-gray-500">{filteredData.length} items</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                      <div className="text-sm text-gray-500">{item.sku}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.expiryDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${item.value}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleViewItem(item)}
                        className="text-primary-600 hover:text-primary-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditItem(item)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit Item"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item)}
                        className="text-danger-600 hover:text-danger-900"
                        title="Delete Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {showAddModal ? 'Add New Item' : 'Edit Item'}
              </h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={newItem.productName}
                  onChange={(e) => setNewItem({...newItem, productName: e.target.value})}
                  className="input-field"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  className="input-field"
                >
                  <option value="">Select category</option>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  value={newItem.sku}
                  onChange={(e) => setNewItem({...newItem, sku: e.target.value})}
                  className="input-field"
                  placeholder="Enter SKU"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input
                    type="number"
                    value={newItem.value}
                    onChange={(e) => setNewItem({...newItem, value: parseFloat(e.target.value) || 0})}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={newItem.expiryDate}
                  onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
                <input
                  type="text"
                  value={newItem.warehouse}
                  onChange={(e) => setNewItem({...newItem, warehouse: e.target.value})}
                  className="input-field"
                  placeholder="Enter warehouse"
                />
              </div>
            </div>
            <div className="mt-6 flex space-x-3">
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveItem}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center justify-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {showAddModal ? 'Add Item' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-danger-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Delete Item</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{selectedItem.productName}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-danger-600 text-white rounded-md hover:bg-danger-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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

export default Inventory; 