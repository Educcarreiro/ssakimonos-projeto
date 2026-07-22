import { Body, Controller, Get, Post } from "@nestjs/common";
import { InvoiceType } from "@ssa/database";
import { FiscalService } from "./fiscal.service";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { CurrentUser, AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@Controller("fiscal")
export class FiscalController {
  constructor(private readonly fiscalService: FiscalService) {}

  @Get("invoices")
  @RequirePermission("fiscal.view")
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.fiscalService.findAll(user.tenantId);
  }

  @Post("invoices")
  @RequirePermission("fiscal.issue")
  requestIssue(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { orderId: string; type: InvoiceType },
  ) {
    return this.fiscalService.requestIssue(user.tenantId, body.orderId, body.type);
  }
}
