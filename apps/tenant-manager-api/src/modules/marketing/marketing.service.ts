import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateCouponDto } from "./dto/create-coupon.dto";

@Injectable()
export class MarketingService {
  constructor(private readonly prisma: PrismaService) {}

  coupons(tenantId: string) {
    return this.prisma.client.coupon.findMany({ where: { tenantId }, orderBy: { code: "asc" } });
  }

  createCoupon(tenantId: string, dto: CreateCouponDto) {
    return this.prisma.client.coupon.create({
      data: {
        tenantId,
        code: dto.code.toUpperCase(),
        type: dto.type,
        value: dto.value,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        usageLimit: dto.usageLimit,
      },
    });
  }

  campaigns(tenantId: string) {
    return this.prisma.client.campaign.findMany({ where: { tenantId }, include: { coupon: true } });
  }
}
