import { IsEnum } from "class-validator";
import { OrderStatus } from "@ssa/database";

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}
