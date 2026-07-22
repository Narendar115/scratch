import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';
import { AuthRequest } from '../types';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search, category, stockStatus } = req.query;
    const result = await ProductService.getProducts({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string,
      category: category as string,
      stockStatus: stockStatus as 'low_stock' | 'normal'
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    return res.json(product);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const createdBy = req.user?.name || 'Warehouse Staff';
    const product = await ProductService.createProduct(req.body, createdBy);
    return res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await ProductService.updateProduct(req.params.id, req.body);
    return res.json(product);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ProductService.deleteProduct(req.params.id);
    return res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const adjustStock = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { quantityChanged, movementType, reason } = req.body;
    const createdBy = req.user?.name || 'Warehouse Manager';
    const result = await ProductService.adjustStock(
      req.params.id,
      quantityChanged,
      movementType,
      reason,
      createdBy
    );
    return res.json({ message: 'Stock adjusted successfully', result });
  } catch (err) {
    next(err);
  }
};

export const getStockLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query;
    const result = await ProductService.getStockLogs({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
};
