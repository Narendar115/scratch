import { api } from './api';
import { Customer, PaginatedResponse, CustomerNote } from '../types';

export const customerService = {
  getCustomers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerType?: string;
  }): Promise<PaginatedResponse<Customer>> => {
    const res = await api.get('/customers', { params });
    return res.data;
  },

  getCustomerById: async (id: string): Promise<Customer> => {
    const res = await api.get(`/customers/${id}`);
    return res.data;
  },

  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    const res = await api.post('/customers', data);
    return res.data;
  },

  updateCustomer: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const res = await api.put(`/customers/${id}`, data);
    return res.data;
  },

  deleteCustomer: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },

  addCustomerNote: async (
    id: string,
    data: { note: string; followUpDate?: string | null }
  ): Promise<CustomerNote> => {
    const res = await api.post(`/customers/${id}/notes`, data);
    return res.data;
  }
};
