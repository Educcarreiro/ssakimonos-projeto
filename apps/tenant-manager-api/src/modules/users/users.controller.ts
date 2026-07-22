import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { CurrentUser, AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermission("users.manage")
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findAll(user.tenantId);
  }

  @Get(":id")
  @RequirePermission("users.manage")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.usersService.findOne(user.tenantId, id);
  }

  @Post()
  @RequirePermission("users.manage")
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateUserDto) {
    return this.usersService.create(user.tenantId, dto);
  }

  @Delete(":id")
  @RequirePermission("users.manage")
  deactivate(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.usersService.deactivate(user.tenantId, id);
  }
}
