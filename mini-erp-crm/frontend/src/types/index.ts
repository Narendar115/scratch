export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  note: string;
  followUpDate?: string | null;
  createdBy: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  customerType: 'RETAILER' | 'WHOLESALER' | 'DISTRIBUTOR';
  address: string;
  status: 'LEAD' | 'ACTIVE' | 'INACTIVE';
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  customerNotes?: CustomerNote[];
  _count?: {
    challans?: number;
    customerNotes?: number;
  };
}

export interface StockLog {
  id: string;
  productId: string;
  quantityChanged: number;
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT';
  reason: string;
  createdBy: string;
  createdAt: string;
  product?: {
    name: string;
    sku: string;
    category: string;
  };
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockLevel: number;
  warehouseLocation: string;
  description?: string | null;
  createdAt: string;
  stockLogs?: StockLog[];
  _count?: {
    stockLogs?: number;
  };
}

export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productName: string;
  productSku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  totalQuantity: number;
  totalAmount: number;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  createdBy: string;
  createdAt: string;
  confirmedAt?: string | null;
  customer?: {
    id: string;
    name: string;
    businessName: string;
    mobile: string;
    email: string;
    address?: string;
    gstNumber?: string;
  };
  items: ChallanItem[];
  invoice?: {
    id: string;
    invoiceNumber: string;
    status: string;
    grandTotal: number;
  } | null;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  challanId: string;
  customerId: string;
  totalAmount: number;
  taxAmount: number;
  grandTotal: number;
  status: 'UNPAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  dueDate?: string | null;
  createdBy: string;
  createdAt: string;
  customer?: Customer;
  challan?: Challan;
}

export interface DashboardStats {
  overview: {
    totalCustomers: number;
    activeLeads: number;
    products: number;
    lowStock: number;
    outOfStock: number;
    todayFollowupsCount: number;
    confirmedChallans: number;
    totalInventoryItems: number;
  };
  revenue: {
    totalRevenue: number;
    paidRevenue: number;
    pendingRevenue: number;
  };
  todayFollowups: Array<{
    id: string;
    name: string;
    businessName: string;
    mobile: string;
    followUpDate: string;
    status: string;
  }>;
  criticalStockAlerts: Product[];
  recentChallans: Challan[];
  categoryDistribution: Array<{
    category: string;
    stock: number;
  }>;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
