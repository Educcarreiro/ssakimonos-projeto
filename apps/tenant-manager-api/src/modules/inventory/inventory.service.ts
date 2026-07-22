import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { StockMovementType } from "@ssa/database";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateMovementDto } from "./dto/create-movement.dto";

const INCREASES_STOCK = new Set<StockMovementType>([
  StockMovementType.ENTRADA,
  StockMovementType.LIBERACAO_RESERVA,
]);
const DECREASES_STOCK = new Set<StockMovementType>([StockMovementType.SAIDA, StockMovementType.RESERVA]);

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  overview(tenantId: string) {
    return this.prisma.client.productVariant.findMany({
      where: { tenantId, isActive: true },
      include: { product: { select: { name: true } } },
      orderBy: { stock: "asc" },
    });
  }

  movements(tenantId: string, variantId?: string) {
    return this.prisma.client.stockMovement.findMany({
      where: { tenantId, ...(variantId ? { variantId } : {}) },
      include: { variant: { select: { sku: true, product: { select: { name: true } } } }, warehouse: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async createMovement(tenantId: string, userId: string, dto: CreateMovementDto) {
    const variant = await this.prisma.client.productVariant.findFirst({
      where: { id: dto.variantId, tenantId },
    });
    if (!variant) throw new NotFoundException("Variação não encontrada");

    // Transferência não altera o total (o estoque neste MVP é global por SKU,
    // não segmentado por depósito) — só fica registrada para rastreabilidade.
    let stockDelta = 0;
    if (INCREASES_STOCK.has(dto.type)) stockDelta = dto.quantity;
    if (DECREASES_STOCK.has(dto.type)) stockDelta = -dto.quantity;
    if (dto.type === StockMovementType.AJUSTE) stockDelta = dto.quantity - variant.stock;

    const nextStock = variant.stock + stockDelta;
    if (nextStock < 0) {
      throw new BadRequestException("Movimentação deixaria o estoque negativo");
    }

    const [movement] = await this.prisma.client.$transaction([
      this.prisma.client.stockMovement.create({
        data: {
          tenantId,
          variantId: dto.variantId,
          warehouseId: dto.warehouseId,
          type: dto.type,
          quantity: dto.quantity,
          reason: dto.reason,
          createdById: userId,
        },
      }),
      this.prisma.client.productVariant.update({
        where: { id: dto.variantId },
        data: { stock: nextStock },
      }),
    ]);

    return movement;
  }
}
