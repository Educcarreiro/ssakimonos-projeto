import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { CouponType } from "@ssa/database";

export class CreateCouponDto {
  @IsString()
  code!: string;

  @IsEnum(CouponType)
  type!: CouponType;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value!: number;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  usageLimit?: number;
}
