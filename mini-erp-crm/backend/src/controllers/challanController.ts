import { Request, Response, NextFunction } from 'express';
import { ChallanService } from '../services/challanService';
import { AuthRequest } from '../types';

export const getChallans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search, status, customerId } = req.query;
    const result = await ChallanService.getChallans({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string,
      status: status as string,
      customerId: customerId as string
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getChallanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const challan = await ChallanService.getChallanById(req.params.id);
    return res.json(challan);
  } catch (err) {
    next(err);
  }
};

export const createChallan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const createdBy = req.user?.name || 'Sales Representative';
    const challan = await ChallanService.createChallan(req.body, createdBy);
    return res.status(201).json(challan);
  } catch (err) {
    next(err);
  }
};

export const updateChallanStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const updatedBy = req.user?.name || 'System';
    const updated = await ChallanService.updateChallanStatus(req.params.id, status, updatedBy);
    return res.json(updated);
  } catch (err) {
    next(err);
  }
};
