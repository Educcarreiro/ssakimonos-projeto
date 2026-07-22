import { Injectable, NotFoundException } from "@nestjs/common";
import { OrderStatus, StockMovementType } from "@ssa/database";
import { PrismaService } from "../../prisma/prisma.service";

// Uma vez que o pedido chega em um desses status, o estoque já foi comprometido.
const STOCK_COMMITTED_STATUSES: OrderStatus[] = [
  OrderStatus.PAGO,
  OrderStatus.EM_SEPARACAO,
  OrderStatus.ENVIADO,
  OrderStatus.ENTREGUE,
];

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string, status?: OrderStatus) {
    return this.prisma.client.order.findMany({
      where: { tenantId, ...(status ? { status } : {}) },
      include: { customer: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const order = await this.prisma.client.order.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        items: { include: { variant: { include: { product: { select: { name: true } } } } } },
        payments: true,
        shipments: true,
        invoices: true,
      },
    });
    if (!order) throw new NotFoundException("Pedido não encontrado");
    return order;
  }

  private async getDefaultWarehouse(tenantId: string) {
    const existing = await this.prisma.client.warehouse.findFirst({
      where: { tenantId },
      orderBy: { isDefault: "desc" },
    });
    if (existing) return existing;
    return this.prisma.client.warehouse.create({
      data: { tenantId, name: "Depósito Principal", isDefault: true },
    });
  }

  /**
   * Baixa (ou devolve) estoque quando o pedido entra ou sai da faixa de
   * status "comprometido" (pago em diante). É a automação nº1 do blueprint:
   * "pedido pago → baixa estoque" — e o inverso quando um pedido pago é
   * cancelado/devolvido/reembolsado.
   */
  private async syncStockForStatusChange(
    tenantId: string,
    order: { id: string; items: Array<{ variantId: string; quantity: number }> },
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
  ) {
    const wasCommitted = STOCK_COMMITTED_STATUSES.includes(fromStatus);
    const willBeCommitted = STOCK_COMMITTED_STATUSES.includes(toStatus);
    if (wasCommitted === willBeCommitted) return;

    const warehouse = await this.getDefaultWarehouse(tenantId);
    const direction = willBeCommitted ? -1 : 1;
    const movementType = willBeCommitted ? StockMovementType.SAIDA : StockMovementType.ENTRADA;
    const reason = willBeCommitted
      ? `Baixa automática — pedido ${order.id.slice(0, 8)} pago`
      : `Estorno automático — pedido ${order.id.slice(0, 8)} cancelado/devolvido`;

    for (const item of order.items) {
      const variant = await this.prisma.client.productVariant.findUnique({ where: { id: item.variantId } });
      if (!variant) continue;

      const nextStock = Math.max(0, variant.stock + direction * item.quantity);

      await this.prisma.client.$transaction([
        this.prisma.client.productVariant.update({
          where: { id: variant.id },
          data: { stock: nextStock },
        }),
        this.prisma.client.stockMovement.create({
          data: {
            tenantId,
            variantId: variant.id,
            warehouseId: warehouse.id,
            type: movementType,
            quantity: item.quantity,
            reason,
            referenceType: "ORDER",
            referenceId: order.id,
          },
        }),
      ]);
    }
  }

  async updateStatus(tenantId: string, id: string, status: OrderStatus) {
    const current = await this.findOne(tenantId, id);
    const updated = await this.prisma.client.order.update({ where: { id }, data: { status } });

    await this.syncStockForStatusChange(
      tenantId,
      { id: current.id, items: current.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })) },
      current.status,
      status,
    );

    return updated;
  }
}
