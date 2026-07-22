import { Request, Response, NextFunction } from 'express';
import { InvoiceService } from '../services/invoiceService';
import { AuthRequest } from '../types';

export const getInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search, status, customerId } = req.query;
    const result = await InvoiceService.getInvoices({
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

export const getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await InvoiceService.getInvoiceById(req.params.id);
    return res.json(invoice);
  } catch (err) {
    next(err);
  }
};

export const createInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const createdBy = req.user?.name || 'Accounts Representative';
    const invoice = await InvoiceService.createInvoice(req.body, createdBy);
    return res.status(201).json(invoice);
  } catch (err) {
    next(err);
  }
};

export const updateInvoiceStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const updated = await InvoiceService.updateInvoiceStatus(req.params.id, status);
    return res.json(updated);
  } catch (err) {
    next(err);
  }
};
