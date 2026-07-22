import { Injectable } from "@nestjs/common";
import { FinancialEntryType } from "@ssa/database";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateEntryDto } from "./dto/create-entry.dto";

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  entries(tenantId: string, type?: FinancialEntryType) {
    return this.prisma.client.financialEntry.findMany({
      where: { tenantId, ...(type ? { type } : {}) },
      orderBy: { dueDate: "asc" },
    });
  }

  createEntry(tenantId: string, dto: CreateEntryDto) {
    return this.prisma.client.financialEntry.create({
      data: { tenantId, ...dto, dueDate: new Date(dto.dueDate) },
    });
  }

  async markPaid(tenantId: string, id: string) {
    return this.prisma.client.financialEntry.updateMany({
      where: { id, tenantId },
      data: { status: "PAGO", paidAt: new Date() },
    });
  }

  /** Fluxo de caixa projetado: soma de lançamentos em aberto por dia, próximos 30 dias. */
  async cashFlowForecast(tenantId: string) {
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    const entries = await this.prisma.client.financialEntry.findMany({
      where: { tenantId, status: "PENDENTE", dueDate: { lte: in30Days } },
      orderBy: { dueDate: "asc" },
    });

    return entries.reduce(
      (acc, entry) => {
        const signed = entry.type === FinancialEntryType.RECEITA ? Number(entry.amount) : -Number(entry.amount);
        acc.projectedBalance += signed;
        acc.entries.push({ dueDate: entry.dueDate, amount: signed, category: entry.category });
        return acc;
      },
      { projectedBalance: 0, entries: [] as Array<{ dueDate: Date; amount: number; category: string }> },
    );
  }
}
