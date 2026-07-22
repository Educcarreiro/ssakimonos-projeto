import { Injectable } from "@nestjs/common";
import { OrderStatus } from "@ssa/database";
import { PrismaService } from "../../prisma/prisma.service";

const PAID_STATUSES: OrderStatus[] = [
  OrderStatus.PAGO,
  OrderStatus.EM_SEPARACAO,
  OrderStatus.ENVIADO,
  OrderStatus.ENTREGUE,
];

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(tenantId: string) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [revenueToday, revenueMonth, ordersToday, ordersMonth, lowStock, recentOrders] =
      await Promise.all([
        this.prisma.client.order.aggregate({
          where: { tenantId, status: { in: PAID_STATUSES }, createdAt: { gte: startOfToday } },
          _sum: { total: true },
        }),
        this.prisma.client.order.aggregate({
          where: { tenantId, status: { in: PAID_STATUSES }, createdAt: { gte: startOfMonth } },
          _sum: { total: true },
        }),
        this.prisma.client.order.count({ where: { tenantId, createdAt: { gte: startOfToday } } }),
        this.prisma.client.order.count({ where: { tenantId, createdAt: { gte: startOfMonth } } }),
        this.prisma.client.productVariant.findMany({
          where: { tenantId, isActive: true },
          include: { product: { select: { name: true } } },
        }),
        this.prisma.client.order.findMany({
          where: { tenantId },
          take: 8,
          orderBy: { createdAt: "desc" },
          include: { customer: { select: { name: true } } },
        }),
      ]);

    const ticketMedio =
      ordersMonth > 0 ? Number(revenueMonth._sum.total ?? 0) / ordersMonth : 0;

    const lowStockVariants = lowStock
      .filter((v) => v.stock <= v.minStock)
      .slice(0, 10);

    return {
      revenueToday: Number(revenueToday._sum.total ?? 0),
      revenueMonth: Number(revenueMonth._sum.total ?? 0),
      ordersToday,
      ordersMonth,
      averageTicket: ticketMedio,
      lowStockProducts: lowStockVariants.map((v) => ({
        variantId: v.id,
        sku: v.sku,
        productName: v.product.name,
        stock: v.stock,
        minStock: v.minStock,
      })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        customerName: o.customer.name,
        total: Number(o.total),
        status: o.status,
        createdAt: o.createdAt,
      })),
    };
  }
}
