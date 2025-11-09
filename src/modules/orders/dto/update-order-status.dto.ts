import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
    @ApiProperty({
        example: 'shipped',
        description: "Order status — one of: 'placed', 'shipped', 'delivered', 'cancelled', 'returned'",
    })
    @IsNotEmpty()
    @IsString()
    status: string;
}
