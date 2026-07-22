import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CustomersService } from "./customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { CurrentUser, AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @RequirePermission("customers.view")
  findAll(@CurrentUser() user: AuthenticatedUser, @Query("search") search?: string) {
    return this.customersService.findAll(user.tenantId, search);
  }

  @Get(":id")
  @RequirePermission("customers.view")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.customersService.findOne(user.tenantId, id);
  }

  @Post()
  @RequirePermission("customers.edit")
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(user.tenantId, dto);
  }
}
