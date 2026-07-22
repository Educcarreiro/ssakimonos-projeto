import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { GenerateVariantsDto } from "./dto/generate-variants.dto";
import { UpsertVariantDto } from "./dto/upsert-variant.dto";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { CurrentUser, AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermission("products.view")
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("search") search?: string,
    @Query("categoryId") categoryId?: string,
    @Query("brandId") brandId?: string,
    @Query("isActive") isActive?: string,
  ) {
    return this.productsService.findAll(user.tenantId, { search, categoryId, brandId, isActive });
  }

  @Get(":id")
  @RequirePermission("products.view")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.productsService.findOne(user.tenantId, id);
  }

  @Post()
  @RequirePermission("products.create")
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateProductDto) {
    return this.productsService.create(user.tenantId, dto);
  }

  @Patch(":id")
  @RequirePermission("products.edit")
  update(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(user.tenantId, id, dto);
  }

  @Delete(":id")
  @RequirePermission("products.delete")
  deactivate(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.productsService.deactivate(user.tenantId, id);
  }

  @Post(":id/variants/generate")
  @RequirePermission("products.edit")
  generateVariants(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: GenerateVariantsDto,
  ) {
    return this.productsService.generateVariants(user.tenantId, id, dto);
  }

  @Post(":id/variants")
  @RequirePermission("products.edit")
  upsertVariant(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpsertVariantDto,
  ) {
    return this.productsService.upsertVariant(user.tenantId, id, dto);
  }

  @Delete("variants/:variantId")
  @RequirePermission("products.edit")
  removeVariant(@CurrentUser() user: AuthenticatedUser, @Param("variantId") variantId: string) {
    return this.productsService.removeVariant(user.tenantId, variantId);
  }
}
