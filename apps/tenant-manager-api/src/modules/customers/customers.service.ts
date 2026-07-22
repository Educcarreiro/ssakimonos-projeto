import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string, search?: string) {
    return this.prisma.client.customer.findMany({
      where: {
        tenantId,
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const customer = await this.prisma.client.customer.findFirst({
      where: { id, tenantId },
      include: {
        addresses: true,
        orders: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });
    if (!customer) throw new NotFoundException("Cliente não encontrado");

    const totalSpent = customer.orders.reduce((sum, o) => sum + Number(o.total), 0);

    return { ...customer, totalSpent, ordersCount: customer.orders.length };
  }

  create(tenantId: string, dto: CreateCustomerDto) {
    return this.prisma.client.customer.create({ data: { tenantId, ...dto } });
  }
}
