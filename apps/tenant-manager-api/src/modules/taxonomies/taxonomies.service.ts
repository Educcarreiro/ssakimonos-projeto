import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * Brand, Category, Collection e Supplier são pequenas listas de apoio ao
 * cadastro de produto — agrupadas em um único serviço para evitar 4 módulos
 * quase idênticos.
 */
@Injectable()
export class TaxonomiesService {
  constructor(private readonly prisma: PrismaService) {}

  brands(tenantId: string) {
    return this.prisma.client.brand.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
  }

  createBrand(tenantId: string, name: string, slug: string) {
    return this.prisma.client.brand.create({ data: { tenantId, name, slug } });
  }

  categories(tenantId: string) {
    return this.prisma.client.category.findMany({
      where: { tenantId },
      include: { children: true },
      orderBy: { name: "asc" },
    });
  }

  createCategory(tenantId: string, name: string, slug: string, parentId?: string) {
    return this.prisma.client.category.create({ data: { tenantId, name, slug, parentId } });
  }

  collections(tenantId: string) {
    return this.prisma.client.collection.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
  }

  createCollection(tenantId: string, name: string, slug: string) {
    return this.prisma.client.collection.create({ data: { tenantId, name, slug } });
  }

  suppliers(tenantId: string) {
    return this.prisma.client.supplier.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
  }

  createSupplier(tenantId: string, name: string, document?: string, email?: string, phone?: string) {
    return this.prisma.client.supplier.create({ data: { tenantId, name, document, email, phone } });
  }
}
