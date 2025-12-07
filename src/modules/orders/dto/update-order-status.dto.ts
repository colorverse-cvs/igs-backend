import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

export const ORDER_STATUSES = ['pending', 'placed', 'shipped', 'delivered', 'cancelled', 'returned'] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: 'shipped',
    description: "Order status — one of: 'pending', 'placed', 'shipped', 'delivered', 'cancelled', 'returned'",
    enum: ORDER_STATUSES,
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(ORDER_STATUSES as unknown as string[])
  status: OrderStatus;

  @ApiProperty({ example: 'Customer requested cancellation', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
