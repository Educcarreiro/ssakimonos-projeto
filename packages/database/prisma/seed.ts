import "dotenv/config";
import { PrismaClient, StockMovementType } from "@prisma/client";
import { hash } from "argon2";

const prisma = new PrismaClient();

const PERMISSIONS = [
  "dashboard.view",
  "products.view",
  "products.create",
  "products.edit",
  "products.delete",
  "inventory.view",
  "inventory.manage",
  "orders.view",
  "orders.create",
  "orders.edit",
  "orders.refund",
  "customers.view",
  "customers.edit",
  "finance.view",
  "finance.manage",
  "finance.export",
  "fiscal.view",
  "fiscal.issue",
  "marketing.view",
  "marketing.manage",
  "users.manage",
  "reports.export",
  "audit.view",
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER_ADMIN: PERMISSIONS,
  FINANCEIRO: [
    "dashboard.view",
    "products.view",
    "orders.view",
    "orders.refund",
    "finance.view",
    "finance.manage",
    "finance.export",
    "fiscal.view",
    "fiscal.issue",
    "reports.export",
  ],
  ESTOQUE: [
    "dashboard.view",
    "products.view",
    "products.create",
    "products.edit",
    "inventory.view",
    "inventory.manage",
    "orders.view",
    "reports.export",
  ],
  ATENDIMENTO: [
    "dashboard.view",
    "products.view",
    "orders.view",
    "orders.create",
    "orders.edit",
    "customers.view",
    "customers.edit",
  ],
  MARKETING: [
    "dashboard.view",
    "products.view",
    "customers.view",
    "marketing.view",
    "marketing.manage",
    "reports.export",
  ],
  AUDITOR: [
    "dashboard.view",
    "products.view",
    "inventory.view",
    "orders.view",
    "customers.view",
    "finance.view",
    "fiscal.view",
    "marketing.view",
    "audit.view",
    "reports.export",
  ],
};

async function main() {
  console.log("Seed — Tenant Manager (SSA Fight Wear)");

  const tenant = await prisma.tenant.upsert({
    where: { slug: "ssa-fight-wear" },
    update: {},
    create: { name: "SSA Fight Wear", slug: "ssa-fight-wear" },
  });

  const permissionRecords: Record<string, { id: string }> = {};
  for (const code of PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: { code },
      update: {},
      create: { code, description: code.replace(".", " → ") },
    });
    permissionRecords[code] = permission;
  }

  const roles: Record<string, { id: string }> = {};
  for (const [roleName, perms] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: roleName } },
      update: {},
      create: { tenantId: tenant.id, name: roleName },
    });
    roles[roleName] = role;

    for (const code of perms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permissionRecords[code].id } },
        update: {},
        create: { roleId: role.id, permissionId: permissionRecords[code].id },
      });
    }
  }

  const passwordHash = await hash("trocar123");
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "admin@ssafightwear.com.br" } },
    update: {},
    create: {
      tenantId: tenant.id,
      roleId: roles.OWNER_ADMIN.id,
      name: "Administrador SSA",
      email: "admin@ssafightwear.com.br",
      passwordHash,
    },
  });

  const warehouse = await prisma.warehouse.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      tenantId: tenant.id,
      name: "Depósito Principal",
      isDefault: true,
    },
  });

  const brand = await prisma.brand.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: "ssa" } },
    update: {},
    create: { tenantId: tenant.id, name: "SSA", slug: "ssa" },
  });

  const category = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: "kimonos" } },
    update: {},
    create: { tenantId: tenant.id, name: "Kimonos", slug: "kimonos" },
  });

  const product = await prisma.product.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: "kimono-competidor" } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "Kimono Competidor",
      description: "Kimono de competição em brim reforçado, corte atlético.",
      slug: "kimono-competidor",
      brandId: brand.id,
      categoryId: category.id,
      price: 549.0,
      costPrice: 210.0,
      ncm: "6211.20.00",
      isActive: true,
      isFeatured: true,
      tags: ["bjj", "competicao", "kimono"],
    },
  });

  const variantsSeed = [
    { color: "Branco", size: "A1", sku: "KC-BR-A1", stock: 12 },
    { color: "Branco", size: "A2", sku: "KC-BR-A2", stock: 8 },
    { color: "Azul", size: "A2", sku: "KC-AZ-A2", stock: 3, price: 569.0 },
    { color: "Preto", size: "A3", sku: "KC-PT-A3", stock: 0, price: 569.0 },
  ];

  for (const v of variantsSeed) {
    const variant = await prisma.productVariant.upsert({
      where: { tenantId_sku: { tenantId: tenant.id, sku: v.sku } },
      update: {},
      create: {
        tenantId: tenant.id,
        productId: product.id,
        sku: v.sku,
        color: v.color,
        size: v.size,
        stock: v.stock,
        minStock: 5,
        price: v.price ?? undefined,
      },
    });

    if (v.stock > 0) {
      await prisma.stockMovement.create({
        data: {
          tenantId: tenant.id,
          variantId: variant.id,
          warehouseId: warehouse.id,
          type: StockMovementType.ENTRADA,
          quantity: v.stock,
          reason: "Carga inicial (seed)",
        },
      });
    }
  }

  console.log("Seed concluído. Login: admin@ssafightwear.com.br / senha: trocar123");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
