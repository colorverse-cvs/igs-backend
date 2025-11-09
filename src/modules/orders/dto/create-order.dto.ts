import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsArray, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
    @ApiProperty({
        example: 'f2a4a821-4f3b-4dfb-bd03-13461a1c7a9f',
        description: 'UUID of the product being ordered',
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
        example: '6d4427f5-2a0c-4976-b1f4-95d1c67acaf5',
        description: 'UUID of the user placing the order',
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
