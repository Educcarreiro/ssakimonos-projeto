import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { GenerateVariantsDto } from "./dto/generate-variants.dto";
import { UpsertVariantDto } from "./dto/upsert-variant.dto";

interface AttributeCombo {
  color?: string;
  size?: string;
  model?: string;
  material?: string;
}

const DIACRITICS_REGEX = new RegExp("[̀-ͯ]", "g");

function shortCode(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 3);
}

/**
 * Produto cartesiano dos atributos informados — a mesma lógica que gera
 * "Kimono Competidor: Branco/Azul/Preto x A0..A4" em 15 variações sem que
 * o usuário precise montar linha por linha.
 */
function buildCombinations(dto: GenerateVariantsDto): AttributeCombo[] {
  const allDimensions: Array<{ key: keyof AttributeCombo; values: string[] }> = [
    { key: "color" as const, values: dto.colors ?? [] },
    { key: "size" as const, values: dto.sizes ?? [] },
    { key: "model" as const, values: dto.models ?? [] },
    { key: "material" as const, values: dto.materials ?? [] },
  ];
  const dimensions = allDimensions.filter((d) => d.values.length > 0);

  if (dimensions.length === 0) {
    throw new BadRequestException("Informe ao menos um atributo (cor, tamanho, modelo ou material)");
  }

  let combos: AttributeCombo[] = [{}];
  for (const dimension of dimensions) {
    const next: AttributeCombo[] = [];
    for (const combo of combos) {
      for (const value of dimension.values) {
        next.push({ ...combo, [dimension.key]: value });
      }
    }
    combos = next;
  }

  return combos;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    filters: { search?: string; categoryId?: string; brandId?: string; isActive?: string },
  ) {
    return this.prisma.client.product.findMany({
      where: {
        tenantId,
        ...(filters.search
          ? { name: { contains: filters.search, mode: "insensitive" } }
          : {}),
        ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
        ...(filters.brandId ? { brandId: filters.brandId } : {}),
        ...(filters.isActive !== undefined ? { isActive: filters.isActive === "true" } : {}),
      },
      include: {
        brand: true,
        category: true,
        variants: { select: { id: true, sku: true, stock: true, minStock: true, price: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.prisma.client.product.findFirst({
      where: { id, tenantId },
      include: {
        brand: true,
        category: true,
        collection: true,
        supplier: true,
        variants: { orderBy: { createdAt: "asc" } },
        images: { orderBy: { order: "asc" } },
      },
    });

    if (!product) throw new NotFoundException("Produto não encontrado");
    return product;
  }

  create(tenantId: string, dto: CreateProductDto) {
    return this.prisma.client.product.create({
      data: { tenantId, ...dto },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(tenantId, id);
    return this.prisma.client.product.update({ where: { id }, data: dto });
  }

  async deactivate(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.client.product.update({ where: { id }, data: { isActive: false } });
  }

  /**
   * Gera a matriz de variações combinando os atributos informados.
   * Nunca cria variação duplicada: se a combinação (cor+tamanho+modelo+material)
   * já existir para o produto, ela é ignorada silenciosamente e reportada em `skipped`.
   */
  async generateVariants(tenantId: string, productId: string, dto: GenerateVariantsDto) {
    const product = await this.findOne(tenantId, productId);
    const combos = buildCombinations(dto);

    const existingCombos = new Set(
      product.variants.map((v) => [v.color, v.size, v.model, v.material].join("|")),
    );
    const existingSkus = new Set(product.variants.map((v) => v.sku));

    const created: string[] = [];
    const skipped: string[] = [];

    for (const combo of combos) {
      const comboKey = [combo.color, combo.size, combo.model, combo.material].join("|");
      if (existingCombos.has(comboKey)) {
        skipped.push(comboKey);
        continue;
      }

      const parts = [combo.color, combo.size, combo.model, combo.material]
        .filter(Boolean)
        .map((v) => shortCode(v as string));
      let sku = [dto.skuPrefix, ...parts].join("-");
      let suffix = 1;
      while (existingSkus.has(sku)) {
        suffix += 1;
        sku = [dto.skuPrefix, ...parts, suffix].join("-");
      }
      existingSkus.add(sku);

      await this.prisma.client.productVariant.create({
        data: {
          tenantId,
          productId,
          sku,
          color: combo.color,
          size: combo.size,
          model: combo.model,
          material: combo.material,
          stock: dto.defaultStock ?? 0,
          minStock: dto.defaultMinStock ?? 0,
        },
      });

      created.push(sku);
    }

    return { createdCount: created.length, created, skippedCount: skipped.length };
  }

  async upsertVariant(tenantId: string, productId: string, dto: UpsertVariantDto) {
    await this.findOne(tenantId, productId);

    return this.prisma.client.productVariant.upsert({
      where: { tenantId_sku: { tenantId, sku: dto.sku } },
      update: dto,
      create: { tenantId, productId, ...dto },
    });
  }

  async removeVariant(tenantId: string, variantId: string) {
    const variant = await this.prisma.client.productVariant.findFirst({ where: { id: variantId, tenantId } });
    if (!variant) throw new NotFoundException("Variação não encontrada");
    return this.prisma.client.productVariant.update({ where: { id: variantId }, data: { isActive: false } });
  }
}
