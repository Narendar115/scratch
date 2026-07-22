import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboardService';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await DashboardService.getStats();
    return res.json(stats);
  } catch (err) {
    next(err);
  }
};
