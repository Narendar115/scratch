import { api } from './api';
import { Product, PaginatedResponse, StockLog } from '../types';

export const productService = {
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    stockStatus?: 'low_stock' | 'normal';
  }): Promise<PaginatedResponse<Product>> => {
    const res = await api.get('/products', { params });
    return res.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const res = await api.post('/products', data);
    return res.data;
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  adjustStock: async (
    id: string,
    data: {
      quantityChanged: number;
      movementType: 'IN' | 'OUT' | 'ADJUSTMENT';
      reason: string;
    }
  ): Promise<any> => {
    const res = await api.post(`/products/${id}/adjust-stock`, data);
    return res.data;
  },

  getStockLogs: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<StockLog>> => {
    const res = await api.get('/inventory/movement', { params });
    return res.data;
  }
};
