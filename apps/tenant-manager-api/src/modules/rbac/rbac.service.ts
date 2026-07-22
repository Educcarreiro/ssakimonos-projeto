import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) {}

  listRoles(tenantId: string) {
    return this.prisma.client.role.findMany({
      where: { tenantId },
      include: { permissions: { include: { permission: true } } },
    });
  }

  listPermissions() {
    return this.prisma.client.permission.findMany({ orderBy: { code: "asc" } });
  }
}
