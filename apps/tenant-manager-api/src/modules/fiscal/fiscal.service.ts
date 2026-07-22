import { Injectable, NotFoundException } from "@nestjs/common";
import { InvoiceType } from "@ssa/database";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * Emissão fiscal real depende de certificado digital A1 (cofre de segredos)
 * e integração com SEFAZ — fora do escopo deste esqueleto. Aqui já fica a
 * modelagem e o fluxo de estado para plugar o provedor (ex.: Focus NF-e,
 * eNotas) sem precisar redesenhar nada.
 */
@Injectable()
export class FiscalService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.client.invoice.findMany({
      where: { tenantId },
      orderBy: { issuedAt: "desc" },
    });
  }

  async requestIssue(tenantId: string, orderId: string, type: InvoiceType) {
    const order = await this.prisma.client.order.findFirst({ where: { id: orderId, tenantId } });
    if (!order) throw new NotFoundException("Pedido não encontrado");

    return this.prisma.client.invoice.create({
      data: {
        tenantId,
        orderId,
        type,
        status: "AGUARDANDO_PROVEDOR_FISCAL",
      },
    });
  }
}
