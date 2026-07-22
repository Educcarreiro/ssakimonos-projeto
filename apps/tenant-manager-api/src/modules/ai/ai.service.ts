import { Injectable } from "@nestjs/common";
import { StockMovementType } from "@ssa/database";
import { PrismaService } from "../../prisma/prisma.service";
import { parseInvoiceFile, ParsedInvoiceItem } from "./invoice-parser";
import { ConfirmInvoiceDto } from "./dto/confirm-invoice.dto";

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "produto"
  );
}

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Etapa 1 — lê o arquivo (XML da NF-e ou PDF) e tenta casar cada item com
   * uma variação já cadastrada (por código de barras, depois por SKU/código).
   * Não escreve nada no banco ainda — isso só acontece na confirmação.
   */
  async importInvoice(tenantId: string, buffer: Buffer, filename: string, mimetype: string) {
    const parsed = await parseInvoiceFile(buffer, filename, mimetype);

    const items = await Promise.all(
      parsed.items.map(async (item) => {
        const match = await this.findMatch(tenantId, item);
        return {
          ...item,
          match,
          suggestedAction: match ? "UPDATE_STOCK" : "CREATE_NEW",
        };
      }),
    );

    return {
      supplierName: parsed.supplierName,
      supplierDocument: parsed.supplierDocument,
      sourceType: parsed.sourceType,
      warnings: parsed.warnings,
      items,
    };
  }

  private async findMatch(tenantId: string, item: ParsedInvoiceItem) {
    if (item.barcode) {
      const byBarcode = await this.prisma.client.productVariant.findFirst({
        where: { tenantId, barcode: item.barcode },
        include: { product: { select: { name: true } } },
      });
      if (byBarcode) return this.toMatch(byBarcode);
    }

    if (item.code) {
      const bySku = await this.prisma.client.productVariant.findFirst({
        where: { tenantId, sku: item.code },
        include: { product: { select: { name: true } } },
      });
      if (bySku) return this.toMatch(bySku);
    }

    if (item.name) {
      const byName = await this.prisma.client.product.findFirst({
        where: { tenantId, name: { equals: item.name, mode: "insensitive" } },
        include: { variants: { take: 1 } },
      });
      if (byName?.variants[0]) {
        return this.toMatch({ ...byName.variants[0], product: { name: byName.name } });
      }
    }

    return null;
  }

  private toMatch(variant: { id: string; sku: string; stock: number; product: { name: string } }) {
    return {
      variantId: variant.id,
      sku: variant.sku,
      productName: variant.product.name,
      currentStock: variant.stock,
    };
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
   * Etapa 2 — grava de fato: item marcado UPDATE soma estoque na variação
   * existente; item CREATE cria produto + variação novos. Sempre com
   * StockMovement de ENTRADA para manter o histórico rastreável.
   */
  async confirmInvoiceImport(tenantId: string, dto: ConfirmInvoiceDto) {
    const warehouse = await this.getDefaultWarehouse(tenantId);
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const item of dto.items) {
      if (item.action === "SKIP") {
        skippedCount += 1;
        continue;
      }

      if (item.action === "UPDATE" && item.variantId) {
        const variant = await this.prisma.client.productVariant.findFirst({
          where: { id: item.variantId, tenantId },
        });
        if (!variant) {
          skippedCount += 1;
          continue;
        }

        await this.prisma.client.$transaction([
          this.prisma.client.productVariant.update({
            where: { id: variant.id },
            data: { stock: variant.stock + item.quantity, costPrice: item.unitValue },
          }),
          this.prisma.client.stockMovement.create({
            data: {
              tenantId,
              variantId: variant.id,
              warehouseId: warehouse.id,
              type: StockMovementType.ENTRADA,
              quantity: item.quantity,
              reason: `Importação de nota fiscal${dto.supplierName ? ` — ${dto.supplierName}` : ""}`,
              referenceType: "INVOICE_IMPORT",
            },
          }),
        ]);
        updatedCount += 1;
        continue;
      }

      if (item.action === "CREATE") {
        const name = item.name?.trim() || "Produto importado";
        const price = item.price ?? Math.round(item.unitValue * 2 * 100) / 100;
        const baseSlug = slugify(name);
        const slug = `${baseSlug}-${Date.now().toString(36)}`;
        const sku = item.code?.trim() || `IMP-${Date.now().toString(36).toUpperCase()}`;

        const product = await this.prisma.client.product.create({
          data: {
            tenantId,
            name,
            slug,
            price,
            costPrice: item.unitValue,
            ncm: item.ncm,
            isActive: true,
          },
        });

        const variant = await this.prisma.client.productVariant.create({
          data: {
            tenantId,
            productId: product.id,
            sku,
            barcode: item.barcode,
            stock: item.quantity,
            minStock: 0,
            costPrice: item.unitValue,
          },
        });

        await this.prisma.client.stockMovement.create({
          data: {
            tenantId,
            variantId: variant.id,
            warehouseId: warehouse.id,
            type: StockMovementType.ENTRADA,
            quantity: item.quantity,
            reason: `Importação de nota fiscal${dto.supplierName ? ` — ${dto.supplierName}` : ""}`,
            referenceType: "INVOICE_IMPORT",
          },
        });

        createdCount += 1;
      }
    }

    return { createdCount, updatedCount, skippedCount };
  }

  async copilotChat(question: string) {
    return {
      status: "MOCK",
      question,
      answer:
        "Copiloto ainda não conectado a um provedor de IA neste esqueleto. Plugue OPENAI_API_KEY ou ANTHROPIC_API_KEY em .env e implemente a chamada aqui.",
    };
  }
}
