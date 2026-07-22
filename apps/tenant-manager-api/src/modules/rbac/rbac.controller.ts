import { Controller, Get } from "@nestjs/common";
import { RbacService } from "./rbac.service";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { CurrentUser, AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@Controller("rbac")
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get("roles")
  @RequirePermission("users.manage")
  listRoles(@CurrentUser() user: AuthenticatedUser) {
    return this.rbacService.listRoles(user.tenantId);
  }

  @Get("permissions")
  @RequirePermission("users.manage")
  listPermissions() {
    return this.rbacService.listPermissions();
  }
}
