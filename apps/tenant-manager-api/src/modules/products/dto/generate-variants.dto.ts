import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

/**
 * Entrada da matriz de variações: cada atributo preenchido vira uma dimensão
 * da combinatória. "Cor: [Branco, Azul, Preto]" x "Tamanho: [A0..A4]" gera
 * 15 variações — sempre do mesmo produto-pai, nunca um cadastro novo.
 */
export class GenerateVariantsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colors?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sizes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  models?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materials?: string[];

  @IsString()
  @MinLength(1)
  skuPrefix!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  defaultStock?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  defaultMinStock?: number;
}
