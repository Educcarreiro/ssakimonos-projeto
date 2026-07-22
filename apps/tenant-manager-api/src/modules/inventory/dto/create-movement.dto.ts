import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { StockMovementType } from "@ssa/database";

export class CreateMovementDto {
  @IsUUID()
  variantId!: string;

  @IsUUID()
  warehouseId!: string;

  @IsEnum(StockMovementType)
  type!: StockMovementType;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
