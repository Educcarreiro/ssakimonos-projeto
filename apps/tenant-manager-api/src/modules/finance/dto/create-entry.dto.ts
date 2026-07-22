import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { FinancialEntryType } from "@ssa/database";

export class CreateEntryDto {
  @IsEnum(FinancialEntryType)
  type!: FinancialEntryType;

  @IsString()
  category!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsDateString()
  dueDate!: string;
}
