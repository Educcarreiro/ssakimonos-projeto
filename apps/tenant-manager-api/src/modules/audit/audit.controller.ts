import { Controller, Get, Query } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { CurrentUser, AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@Controller("audit")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermission("audit.view")
  findAll(@CurrentUser() user: AuthenticatedUser, @Query("module") module?: string) {
    return this.auditService.findAll(user.tenantId, module);
  }
}
