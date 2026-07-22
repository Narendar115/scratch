import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';

export class ProductService {
  static async getProducts(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    stockStatus?: 'low_stock' | 'normal';
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      const s = query.search;
      where.OR = [
        { name: { contains: s } },
        { sku: { contains: s } },
        { warehouseLocation: { contains: s } }
      ];
    }

    let products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { stockLogs: true }
        }
      }
    });

    if (query.stockStatus === 'low_stock') {
      products = products.filter((p) => p.currentStock <= p.minStockLevel);
    } else if (query.stockStatus === 'normal') {
      products = products.filter((p) => p.currentStock > p.minStockLevel);
    }

    const total = products.length;
    const paginated = products.slice(skip, skip + limit);

    return {
      data: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  static async createProduct(data: any, createdBy: string) {
    const existing = await prisma.product.findUnique({
      where: { sku: data.sku }
    });

    if (existing) {
      throw new AppError(`Product with SKU '${data.sku}' already exists`, 400);
    }

    return prisma.product.create({
      data: {
        ...data,
        stockLogs: {
          create: {
            quantityChanged: data.currentStock,
            movementType: 'IN',
            reason: 'Initial Product Inventory Stocking',
            createdBy
          }
        }
      }
    });
  }

  static async updateProduct(id: string, data: any) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Product not found', 404);
    }

    return prisma.product.update({
      where: { id },
      data
    });
  }

  static async deleteProduct(id: string) {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { _count: { select: { challanItems: true } } }
    });

    if (!existing) {
      throw new AppError('Product not found', 404);
    }

    if (existing._count.challanItems > 0) {
      throw new AppError('Cannot delete product attached to existing sales challans', 400);
    }

    return prisma.product.delete({ where: { id } });
  }

  static async adjustStock(
    productId: string,
    quantityChanged: number,
    movementType: 'IN' | 'OUT' | 'ADJUSTMENT',
    reason: string,
    createdBy: string
  ) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    let delta = quantityChanged;
    if (movementType === 'OUT' && delta > 0) {
      delta = -delta;
    }

    const newStock = product.currentStock + delta;
    if (newStock < 0) {
      throw new AppError(
        `Insufficient stock for '${product.name}'. Current stock is ${product.currentStock}, cannot reduce by ${Math.abs(delta)}.`,
        400
      );
    }

    return prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { currentStock: newStock }
      }),
      prisma.stockLog.create({
        data: {
          productId,
          quantityChanged: delta,
          movementType,
          reason,
          createdBy
        }
      })
    ]);
  }

  static async getStockLogs(query: { page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 15;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.stockLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { name: true, sku: true, category: true }
          }
        }
      }),
      prisma.stockLog.count()
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
