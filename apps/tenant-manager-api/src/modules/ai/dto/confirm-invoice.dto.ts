import { Type } from "class-transformer";
import { IsArray, IsIn, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";

export class ConfirmInvoiceItemDto {
  @IsIn(["CREATE", "UPDATE", "SKIP"])
  action!: "CREATE" | "UPDATE" | "SKIP";

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  ncm?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitValue!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;
}

export class ConfirmInvoiceDto {
  @IsOptional()
  @IsString()
  supplierName?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmInvoiceItemDto)
  items!: ConfirmInvoiceItemDto[];
}
