const API_BASE_URL = 'http://localhost:5000/api';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  unit: string;
  createdAt: string;
  updatedAt: string;
  inventoryItems: InventoryItem[];
  _count: {
    alerts: number;
    promotions: number;
  };
}

export interface InventoryItem {
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
  product: Product;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  productId: string;
  inventoryItemId?: string;
  type: 'EXPIRY_WARNING' | 'LOW_STOCK' | 'EXPIRED_ITEM' | 'PROMOTION_OPPORTUNITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  isRead: boolean;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  product: Product;
  inventoryItem?: InventoryItem;
}

export interface Promotion {
  id: string;
  productId: string;
  title: string;
  description: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

export interface Pickup {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  pickupDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: PickupItem[];
}

export interface PickupItem {
  id: string;
  pickupId: string;
  inventoryItemId: string;
  quantity: number;
  createdAt: string;
  inventoryItem: InventoryItem;
}

export interface Analytics {
  totalProducts: number;
  totalInventoryItems: number;
  activeAlerts: number;
  expiringItems: number;
  totalValue: number;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products');
  }

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'inventoryItems' | '_count'>): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Inventory
  async getInventory(): Promise<InventoryItem[]> {
    return this.request<InventoryItem[]>('/inventory');
  }

  async createInventoryItem(data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'product' | 'alerts'>): Promise<InventoryItem> {
    return this.request<InventoryItem>('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    return this.request<Alert[]>('/alerts');
  }

  async updateAlert(id: string, data: Partial<Alert>): Promise<Alert> {
    return this.request<Alert>(`/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Promotions
  async getPromotions(): Promise<Promotion[]> {
    return this.request<Promotion[]>('/promotions');
  }

  // Pickups
  async getPickups(): Promise<Pickup[]> {
    return this.request<Pickup[]>('/pickups');
  }

  async createPickup(data: Omit<Pickup, 'id' | 'createdAt' | 'updatedAt' | 'items'> & { items: Array<{ inventoryItemId: string; quantity: number }> }): Promise<Pickup> {
    return this.request<Pickup>('/pickups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics
  async getAnalytics(): Promise<Analytics> {
    return this.request<Analytics>('/analytics');
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>('/health');
  }
}

export const apiService = new ApiService(); 