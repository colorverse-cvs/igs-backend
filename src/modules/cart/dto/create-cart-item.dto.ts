import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartItemDto {
    @ApiProperty({
        example: '64b2a8e4c58c8a8f1f8e4b12',
        description: 'The MongoDB ObjectId or UUID of the product to add to the cart',
    })
    @IsNotEmpty()
    @IsString()
    productId: string;

    @ApiProperty({
        example: 2,
        description: 'Quantity of the product to add to the cart',
        minimum: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    quantity: number;
}
