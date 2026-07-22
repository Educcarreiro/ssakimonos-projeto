import { Controller, Get } from "@nestjs/common";
import { IntegrationsService } from "./integrations.service";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";

@Controller("integrations")
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @RequirePermission("users.manage")
  list() {
    return this.integrationsService.list();
  }
}
