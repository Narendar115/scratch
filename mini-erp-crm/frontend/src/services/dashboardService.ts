import { api } from './api';
import { DashboardStats } from '../types';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get('/dashboard');
    return res.data;
  }
};
