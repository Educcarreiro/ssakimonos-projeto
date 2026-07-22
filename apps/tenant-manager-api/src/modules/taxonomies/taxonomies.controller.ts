import { Body, Controller, Get, Post } from "@nestjs/common";
import { TaxonomiesService } from "./taxonomies.service";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { CurrentUser, AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@Controller("taxonomies")
export class TaxonomiesController {
  constructor(private readonly taxonomiesService: TaxonomiesService) {}

  @Get("brands")
  @RequirePermission("products.view")
  brands(@CurrentUser() user: AuthenticatedUser) {
    return this.taxonomiesService.brands(user.tenantId);
  }

  @Post("brands")
  @RequirePermission("products.create")
  createBrand(@CurrentUser() user: AuthenticatedUser, @Body() body: { name: string; slug: string }) {
    return this.taxonomiesService.createBrand(user.tenantId, body.name, body.slug);
  }

  @Get("categories")
  @RequirePermission("products.view")
  categories(@CurrentUser() user: AuthenticatedUser) {
    return this.taxonomiesService.categories(user.tenantId);
  }

  @Post("categories")
  @RequirePermission("products.create")
  createCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { name: string; slug: string; parentId?: string },
  ) {
    return this.taxonomiesService.createCategory(user.tenantId, body.name, body.slug, body.parentId);
  }

  @Get("collections")
  @RequirePermission("products.view")
  collections(@CurrentUser() user: AuthenticatedUser) {
    return this.taxonomiesService.collections(user.tenantId);
  }

  @Post("collections")
  @RequirePermission("products.create")
  createCollection(@CurrentUser() user: AuthenticatedUser, @Body() body: { name: string; slug: string }) {
    return this.taxonomiesService.createCollection(user.tenantId, body.name, body.slug);
  }

  @Get("suppliers")
  @RequirePermission("products.view")
  suppliers(@CurrentUser() user: AuthenticatedUser) {
    return this.taxonomiesService.suppliers(user.tenantId);
  }

  @Post("suppliers")
  @RequirePermission("products.create")
  createSupplier(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { name: string; document?: string; email?: string; phone?: string },
  ) {
    return this.taxonomiesService.createSupplier(user.tenantId, body.name, body.document, body.email, body.phone);
  }
}
