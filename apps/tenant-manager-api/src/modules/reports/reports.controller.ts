import { Controller, Get } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { CurrentUser, AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("sales-vs-stock")
  @RequirePermission("reports.export")
  salesVsStock(@CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.salesVsStock(user.tenantId);
  }

  @Get("top-sellers")
  @RequirePermission("reports.export")
  topSellers(@CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.topSellers(user.tenantId);
  }

  @Get("dead-stock")
  @RequirePermission("reports.export")
  deadStock(@CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.deadStock(user.tenantId);
  }
}
