import { api } from './api';
import { Invoice, PaginatedResponse } from '../types';

export const invoiceService = {
  getInvoices: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerId?: string;
  }): Promise<PaginatedResponse<Invoice>> => {
    const res = await api.get('/invoices', { params });
    return res.data;
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    const res = await api.get(`/invoices/${id}`);
    return res.data;
  },

  createInvoice: async (data: {
    challanId: string;
    taxAmount?: number;
    dueDate?: string | null;
  }): Promise<Invoice> => {
    const res = await api.post('/invoices', data);
    return res.data;
  },

  updateInvoiceStatus: async (
    id: string,
    status: 'PAID' | 'UNPAID' | 'OVERDUE' | 'CANCELLED'
  ): Promise<Invoice> => {
    const res = await api.put(`/invoices/${id}/status`, { status });
    return res.data;
  }
};
