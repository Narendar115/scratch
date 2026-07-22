import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';

export class ChallanService {
  static async generateChallanNumber(): Promise<string> {
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const prefix = `CH-${yearMonth}-`;
    const count = await prisma.challan.count();
    const nextSeq = (count + 1).toString().padStart(4, '0');
    return `${prefix}${nextSeq}`;
  }

  static async getChallans(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerId?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.search) {
      const s = query.search;
      where.OR = [
        { challanNumber: { contains: s } },
        { customer: { name: { contains: s } } },
        { customer: { businessName: { contains: s } } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, businessName: true, mobile: true, email: true }
          },
          items: true,
          invoice: {
            select: { id: true, invoiceNumber: true, status: true, grandTotal: true }
          }
        }
      }),
      prisma.challan.count({ where })
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

  static async getChallanById(id: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, currentStock: true, minStockLevel: true }
            }
          }
        },
        invoice: true
      }
    });

    if (!challan) {
      throw new AppError('Challan not found', 404);
    }

    return challan;
  }

  static async createChallan(data: { customerId: string; items: { productId: string; quantity: number }[] }, createdBy: string) {
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    if (products.length !== productIds.length) {
      throw new AppError('One or more selected products were not found', 400);
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalQuantity = 0;
    let totalAmount = 0;

    const challanItemsData = data.items.map((item) => {
      const prod = productMap.get(item.productId)!;
      const subtotal = prod.unitPrice * item.quantity;
      totalQuantity += item.quantity;
      totalAmount += subtotal;

      return {
        productId: prod.id,
        productName: prod.name,
        productSku: prod.sku,
        unitPrice: prod.unitPrice,
        quantity: item.quantity,
        subtotal
      };
    });

    const challanNumber = await this.generateChallanNumber();

    return prisma.challan.create({
      data: {
        challanNumber,
        customerId: data.customerId,
        totalQuantity,
        totalAmount,
        status: 'DRAFT',
        createdBy,
        items: {
          create: challanItemsData
        }
      },
      include: {
        customer: true,
        items: true
      }
    });
  }

  static async updateChallanStatus(id: string, newStatus: 'CONFIRMED' | 'CANCELLED', updatedBy: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: { items: true, customer: true }
    });

    if (!challan) {
      throw new AppError('Challan not found', 404);
    }

    if (challan.status === newStatus) {
      return challan;
    }

    if (challan.status === 'CONFIRMED' && newStatus === 'CANCELLED') {
      throw new AppError('Cannot cancel a confirmed challan once stock has been dispatched', 400);
    }

    if (newStatus === 'CONFIRMED') {
      // Execute stock validation and reduction in an atomic transaction
      return prisma.$transaction(async (tx) => {
        // 1. Verify stock for each item
        for (const item of challan.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) {
            throw new AppError(`Product '${item.productName}' no longer exists`, 400);
          }

          if (product.currentStock < item.quantity) {
            throw new AppError(
              `Stock validation error: Product '${product.name}' (SKU: ${product.sku}) has insufficient stock. Available: ${product.currentStock}, Required: ${item.quantity}`,
              400
            );
          }
        }

        // 2. Reduce stock & create stock movement logs
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: {
                decrement: item.quantity
              }
            }
          });

          await tx.stockLog.create({
            data: {
              productId: item.productId,
              quantityChanged: -item.quantity,
              movementType: 'OUT',
              reason: `Dispatched via Confirmed Sales Challan #${challan.challanNumber}`,
              createdBy: updatedBy
            }
          });
        }

        // 3. Update Challan status
        return tx.challan.update({
          where: { id },
          data: {
            status: 'CONFIRMED',
            confirmedAt: new Date()
          },
          include: {
            customer: true,
            items: true
          }
        });
      });
    }

    // Direct Cancellation from DRAFT
    return prisma.challan.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { customer: true, items: true }
    });
  }
}
