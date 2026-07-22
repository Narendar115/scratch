import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';

export class InvoiceService {
  static async generateInvoiceNumber(): Promise<string> {
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const prefix = `INV-${yearMonth}-`;
    const count = await prisma.invoice.count();
    const nextSeq = (count + 1).toString().padStart(4, '0');
    return `${prefix}${nextSeq}`;
  }

  static async getInvoices(query: {
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
        { invoiceNumber: { contains: s } },
        { customer: { name: { contains: s } } },
        { customer: { businessName: { contains: s } } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, businessName: true, email: true, mobile: true, gstNumber: true, address: true }
          },
          challan: {
            select: { id: true, challanNumber: true, totalQuantity: true }
          }
        }
      }),
      prisma.invoice.count({ where })
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

  static async getInvoiceById(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        challan: {
          include: {
            items: true
          }
        }
      }
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    return invoice;
  }

  static async createInvoice(data: { challanId: string; taxAmount?: number; dueDate?: string | null }, createdBy: string) {
    const challan = await prisma.challan.findUnique({
      where: { id: data.challanId },
      include: { invoice: true }
    });

    if (!challan) {
      throw new AppError('Sales Challan not found', 404);
    }

    if (challan.status !== 'CONFIRMED') {
      throw new AppError('Invoices can only be generated for CONFIRMED sales challans', 400);
    }

    if (challan.invoice) {
      throw new AppError(`Invoice #${challan.invoice.invoiceNumber} already exists for this challan`, 400);
    }

    const invoiceNumber = await this.generateInvoiceNumber();
    const totalAmount = challan.totalAmount;
    const taxAmount = data.taxAmount ?? Math.round(totalAmount * 0.18 * 100) / 100;
    const grandTotal = totalAmount + taxAmount;

    return prisma.invoice.create({
      data: {
        invoiceNumber,
        challanId: data.challanId,
        customerId: challan.customerId,
        totalAmount,
        taxAmount,
        grandTotal,
        status: 'UNPAID',
        dueDate: data.dueDate || null,
        createdBy
      },
      include: {
        customer: true,
        challan: {
          include: { items: true }
        }
      }
    });
  }

  static async updateInvoiceStatus(id: string, status: 'PAID' | 'UNPAID' | 'OVERDUE' | 'CANCELLED') {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    return prisma.invoice.update({
      where: { id },
      data: { status },
      include: { customer: true, challan: true }
    });
  }
}
