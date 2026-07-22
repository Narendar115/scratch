import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customerService';
import { AuthRequest } from '../types';

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search, status, customerType } = req.query;
    const result = await CustomerService.getCustomers({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string,
      status: status as string,
      customerType: customerType as string
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await CustomerService.getCustomerById(req.params.id);
    return res.json(customer);
  } catch (err) {
    next(err);
  }
};

export const createCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const createdBy = req.user?.name || 'System';
    const customer = await CustomerService.createCustomer(req.body, createdBy);
    return res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await CustomerService.updateCustomer(req.params.id, req.body);
    return res.json(customer);
  } catch (err) {
    next(err);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await CustomerService.deleteCustomer(req.params.id);
    return res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const addCustomerNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { note, followUpDate } = req.body;
    const createdBy = req.user?.name || 'System';
    const noteObj = await CustomerService.addNote(req.params.id, note, followUpDate, createdBy);
    return res.status(201).json(noteObj);
  } catch (err) {
    next(err);
  }
};
