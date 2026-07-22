import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { FinancialEntryType } from "@ssa/database";
import { FinanceService } from "./finance.service";
import { CreateEntryDto } from "./dto/create-entry.dto";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { CurrentUser, AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@Controller("finance")
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get("entries")
  @RequirePermission("finance.view")
  entries(@CurrentUser() user: AuthenticatedUser, @Query("type") type?: FinancialEntryType) {
    return this.financeService.entries(user.tenantId, type);
  }

  @Post("entries")
  @RequirePermission("finance.manage")
  createEntry(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateEntryDto) {
    return this.financeService.createEntry(user.tenantId, dto);
  }

  @Patch("entries/:id/pay")
  @RequirePermission("finance.manage")
  markPaid(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.financeService.markPaid(user.tenantId, id);
  }

  @Get("cash-flow-forecast")
  @RequirePermission("finance.view")
  cashFlowForecast(@CurrentUser() user: AuthenticatedUser) {
    return this.financeService.cashFlowForecast(user.tenantId);
  }
}
