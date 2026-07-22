import { api } from './api';
import { Challan, PaginatedResponse } from '../types';

export const challanService = {
  getChallans: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerId?: string;
  }): Promise<PaginatedResponse<Challan>> => {
    const res = await api.get('/challans', { params });
    return res.data;
  },

  getChallanById: async (id: string): Promise<Challan> => {
    const res = await api.get(`/challans/${id}`);
    return res.data;
  },

  createChallan: async (data: {
    customerId: string;
    items: { productId: string; quantity: number }[];
  }): Promise<Challan> => {
    const res = await api.post('/challans', data);
    return res.data;
  },

  updateChallanStatus: async (
    id: string,
    status: 'CONFIRMED' | 'CANCELLED'
  ): Promise<Challan> => {
    const res = await api.put(`/challans/${id}/status`, { status });
    return res.data;
  }
};
