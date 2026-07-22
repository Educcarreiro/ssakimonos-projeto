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
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Relatório de vendas x cobertura de estoque (sell-through): por SKU, quanto
   * vendeu nos últimos 30 dias, quanto tem hoje e para quantos dias esse
   * estoque cobre no ritmo atual de venda — o "o que tem e o que vai faltar".
   */
  async salesVsStock(tenantId: string) {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [variants, soldItems] = await Promise.all([
      this.prisma.client.productVariant.findMany({
        where: { tenantId, isActive: true },
        include: { product: { select: { name: true, category: { select: { name: true } } } } },
      }),
      this.prisma.client.orderItem.findMany({
        where: {
          variant: { tenantId },
          order: { status: { in: PAID_STATUSES }, createdAt: { gte: since } },
        },
        select: { variantId: true, quantity: true },
      }),
    ]);

    const soldByVariant = new Map<string, number>();
    for (const item of soldItems) {
      soldByVariant.set(item.variantId, (soldByVariant.get(item.variantId) ?? 0) + item.quantity);
    }

    return variants
      .map((variant) => {
        const sold30d = soldByVariant.get(variant.id) ?? 0;
        const dailyRate = sold30d / 30;
        const coverageDays = dailyRate > 0 ? Math.round(variant.stock / dailyRate) : null;

        return {
          sku: variant.sku,
          productName: variant.product.name,
          category: variant.product.category?.name ?? null,
          color: variant.color,
          size: variant.size,
          stock: variant.stock,
          minStock: variant.minStock,
          sold30d,
          coverageDays,
          status:
            variant.stock === 0
              ? "SEM_ESTOQUE"
              : variant.stock <= variant.minStock
                ? "ABAIXO_DO_MINIMO"
                : coverageDays !== null && coverageDays <= 7
                  ? "RUPTURA_IMINENTE"
                  : "SAUDAVEL",
        };
      })
      .sort((a, b) => b.sold30d - a.sold30d);
  }

  async topSellers(tenantId: string, limit = 10) {
    const report = await this.salesVsStock(tenantId);
    return report.slice(0, limit);
  }

  async deadStock(tenantId: string) {
    const report = await this.salesVsStock(tenantId);
    return report.filter((r) => r.sold30d === 0 && r.stock > 0);
  }
}
