import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { OrderStatus } from "@ssa/database";
import { OrdersService } from "./orders.service";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { CurrentUser, AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @RequirePermission("orders.view")
  findAll(@CurrentUser() user: AuthenticatedUser, @Query("status") status?: OrderStatus) {
    return this.ordersService.findAll(user.tenantId, status);
  }

  @Get(":id")
  @RequirePermission("orders.view")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.ordersService.findOne(user.tenantId, id);
  }

  @Patch(":id/status")
  @RequirePermission("orders.edit")
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(user.tenantId, id, dto.status);
  }
}
