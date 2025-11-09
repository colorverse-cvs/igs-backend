import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'Wireless Mouse',
    description: 'Product name',
  })
  @IsNotEmpty({ message: 'Product name is required' })
  @IsString({ message: 'Product name must be a string' })
  readonly name: string;

  @ApiProperty({
    example: 'A high-precision wireless mouse with ergonomic design',
    description: 'Product description',
  })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  readonly description: string;

  @ApiProperty({
    example: 1299.99,
    description: 'Product price in INR or USD',
  })
  @IsNotEmpty({ message: 'Price is required' })
  @IsNumber({}, { message: 'Price must be a number' })
  readonly price: number;

  @ApiProperty({
    example: 'MOUSE-123',
    description: 'Unique SKU code for the product',
  })
  @IsNotEmpty({ message: 'SKU is required' })
  @IsString({ message: 'SKU must be a string' })
  readonly sku: string;

  @ApiProperty({
    example: 50,
    description: 'Available quantity in stock',
  })
  @IsNotEmpty({ message: 'Quantity is required' })
  @IsNumber({}, { message: 'Quantity must be a number' })
  readonly quantity: number;

  @ApiProperty({
    example: 'e1c5f42b-0f94-4a2c-937d-1c0a1ad4f5f9',
    description: 'UUID of the category this product belongs to',
  })
  @IsNotEmpty({ message: 'Category ID is required' })
  @IsString({ message: 'Category ID must be a string (UUID)' })
  readonly categoryId: string;
}
