import { Body, Controller, Get, Post } from "@nestjs/common";
import { MarketingService } from "./marketing.service";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { CurrentUser, AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@Controller("marketing")
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get("coupons")
  @RequirePermission("marketing.view")
  coupons(@CurrentUser() user: AuthenticatedUser) {
    return this.marketingService.coupons(user.tenantId);
  }

  @Post("coupons")
  @RequirePermission("marketing.manage")
  createCoupon(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCouponDto) {
    return this.marketingService.createCoupon(user.tenantId, dto);
  }

  @Get("campaigns")
  @RequirePermission("marketing.view")
  campaigns(@CurrentUser() user: AuthenticatedUser) {
    return this.marketingService.campaigns(user.tenantId);
  }
}
