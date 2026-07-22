import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { CreateMovementDto } from "./dto/create-movement.dto";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { CurrentUser, AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@Controller("inventory")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get("overview")
  @RequirePermission("inventory.view")
  overview(@CurrentUser() user: AuthenticatedUser) {
    return this.inventoryService.overview(user.tenantId);
  }

  @Get("movements")
  @RequirePermission("inventory.view")
  movements(@CurrentUser() user: AuthenticatedUser, @Query("variantId") variantId?: string) {
    return this.inventoryService.movements(user.tenantId, variantId);
  }

  @Post("movements")
  @RequirePermission("inventory.manage")
  createMovement(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateMovementDto) {
    return this.inventoryService.createMovement(user.tenantId, user.id, dto);
  }
}
