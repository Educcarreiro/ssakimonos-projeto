import { Controller, Get } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { CurrentUser, AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("overview")
  @RequirePermission("dashboard.view")
  overview(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.overview(user.tenantId);
  }
}
