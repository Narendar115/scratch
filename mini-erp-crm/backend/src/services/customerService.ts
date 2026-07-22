import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';

export class CustomerService {
  static async getCustomers(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerType?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.customerType) {
      where.customerType = query.customerType;
    }

    if (query.search) {
      const s = query.search;
      where.OR = [
        { name: { contains: s } },
        { email: { contains: s } },
        { mobile: { contains: s } },
        { businessName: { contains: s } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { challans: true, customerNotes: true }
          }
        }
      }),
      prisma.customer.count({ where })
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

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        customerNotes: {
          orderBy: { createdAt: 'desc' }
        },
        challans: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    return customer;
  }

  static async createCustomer(data: any, createdBy: string) {
    const existing = await prisma.customer.findFirst({
      where: { email: data.email }
    });

    if (existing) {
      throw new AppError('Customer with this email already exists', 400);
    }

    return prisma.customer.create({
      data: {
        ...data,
        customerNotes: {
          create: {
            note: `Customer profile created. Initial Status: ${data.status || 'ACTIVE'}`,
            createdBy
          }
        }
      }
    });
  }

  static async updateCustomer(id: string, data: any) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Customer not found', 404);
    }

    return prisma.customer.update({
      where: { id },
      data
    });
  }

  static async deleteCustomer(id: string) {
    const existing = await prisma.customer.findUnique({
      where: { id },
      include: { _count: { select: { challans: true } } }
    });

    if (!existing) {
      throw new AppError('Customer not found', 404);
    }

    if (existing._count.challans > 0) {
      throw new AppError('Cannot delete customer with associated sales challans', 400);
    }

    return prisma.customer.delete({ where: { id } });
  }

  static async addNote(customerId: string, note: string, followUpDate?: string | null, createdBy?: string) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const createdNote = await prisma.customerNote.create({
      data: {
        customerId,
        note,
        followUpDate: followUpDate || null,
        createdBy: createdBy || 'System'
      }
    });

    if (followUpDate) {
      await prisma.customer.update({
        where: { id: customerId },
        data: { followUpDate }
      });
    }

    return createdNote;
  }
}
