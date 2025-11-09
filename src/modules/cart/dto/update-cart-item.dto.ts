import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({
    example: 3,
    description: 'Updated quantity for the cart item',
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
