import { prisma } from '../db';

export class DashboardService {
  static async getStats() {
    const todayStr = new Date().toISOString().slice(0, 10);

    const [
      totalCustomers,
      activeLeads,
      products,
      confirmedChallansCount,
      todayFollowups,
      invoices,
      lowStockProducts,
      recentChallans
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'LEAD' } }),
      prisma.product.findMany({ select: { id: true, currentStock: true, minStockLevel: true, category: true, name: true, sku: true, unitPrice: true } }),
      prisma.challan.count({ where: { status: 'CONFIRMED' } }),
      prisma.customer.findMany({
        where: {
          followUpDate: { lte: todayStr },
          status: { in: ['LEAD', 'ACTIVE'] }
        },
        take: 5,
        orderBy: { followUpDate: 'asc' },
        select: { id: true, name: true, businessName: true, mobile: true, followUpDate: true, status: true }
      }),
      prisma.invoice.findMany({
        select: { grandTotal: true, status: true, createdAt: true }
      }),
      prisma.product.findMany({
        orderBy: { currentStock: 'asc' },
        take: 5,
        select: { id: true, name: true, sku: true, currentStock: true, minStockLevel: true, category: true, warehouseLocation: true }
      }),
      prisma.challan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, businessName: true } }
        }
      })
    ]);

    const totalProductsCount = products.length;
    const lowStockCount = products.filter((p) => p.currentStock <= p.minStockLevel).length;
    const outOfStockCount = products.filter((p) => p.currentStock === 0).length;
    const totalInventoryItems = products.reduce((acc, p) => acc + p.currentStock, 0);

    const totalRevenue = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
    const paidRevenue = invoices.filter((i) => i.status === 'PAID').reduce((acc, i) => acc + i.grandTotal, 0);
    const pendingRevenue = invoices.filter((i) => i.status === 'UNPAID' || i.status === 'OVERDUE').reduce((acc, i) => acc + i.grandTotal, 0);

    // Group product stock by category
    const categoryStockMap: Record<string, number> = {};
    products.forEach((p) => {
      categoryStockMap[p.category] = (categoryStockMap[p.category] || 0) + p.currentStock;
    });

    const categoryDistribution = Object.entries(categoryStockMap).map(([category, stock]) => ({
      category,
      stock
    }));

    return {
      overview: {
        totalCustomers,
        activeLeads,
        products: totalProductsCount,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        todayFollowupsCount: todayFollowups.length,
        confirmedChallans: confirmedChallansCount,
        totalInventoryItems
      },
      revenue: {
        totalRevenue,
        paidRevenue,
        pendingRevenue
      },
      todayFollowups,
      criticalStockAlerts: lowStockProducts.filter((p) => p.currentStock <= p.minStockLevel),
      recentChallans,
      categoryDistribution
    };
  }
}
