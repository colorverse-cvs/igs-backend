import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsArray, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
    @ApiProperty({
        example: '64b2a8e4c58c8a8f1f8e4b12',
        description: 'ID of the product being ordered',
    })
    @IsNotEmpty()
    productId: string;

    @ApiProperty({
        example: 2,
        description: 'Quantity of the product ordered',
    })
    @IsNotEmpty()
    @IsNumber()
    quantity: number;
}

export class CreateOrderDto {
    @ApiProperty({
        example: '64b2a8e4c58c8a8f1f8e4b12',
        description: 'ID of the user placing the order',
    })
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        type: [OrderItemDto],
        description: 'List of items included in the order',
    })
    @IsNotEmpty()
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
