import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string, module?: string) {
    return this.prisma.client.auditLog.findMany({
      where: { tenantId, ...(module ? { module } : {}) },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  }
}
