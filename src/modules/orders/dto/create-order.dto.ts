import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsOptional,
  IsString,
  IsEnum,
  IsEmail,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty({
    example: '64b2a8e4c58c8a8f1f8e4b12',
    description: 'ID of the product being ordered',
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({
    example: 2,
    description: 'Quantity of the product ordered',
  })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({
    example: 499.0,
    description: 'Unit price (optional) — used when creating order items server-side if provided',
  })
  @IsOptional()
  @IsNumber()
  price?: number;
}

export class ShippingAddressDto {
  @ApiProperty({ example: '123 MG Road' })
  @IsString()
  line1: string;

  @ApiPropertyOptional({ example: 'Apt 4B' })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiPropertyOptional({ example: 'Landmark' })
  @IsOptional()
  @IsString()
  line3?: string;

  @ApiProperty({ example: 'Bengaluru' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Karnataka' })
  @IsString()
  state: string;

  @ApiProperty({ example: '560001' })
  @IsString()
  postalCode: string;

  @ApiPropertyOptional({ example: 'IN' })
  @IsOptional()
  @IsString()
  country?: string;
}

export enum PaymentMethodDto {
  RAZORPAY = 'razorpay',
  COD = 'cod',
  OTHER = 'other',
}

export class CreateOrderDto {
  @ApiPropertyOptional({
    example: '64b2a8e4c58c8a8f1f8e4b12',
    description: 'ID of the user placing the order (omit for guest)',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ example: 'b8ed23f2-9577-40e9-8606-41cb8c0bde6b', description: 'Session id for guest carts' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({ example: 'cart_123', description: 'Optional cart id associated with the order' })
  @IsOptional()
  @IsString()
  cartId?: string;

  @ApiPropertyOptional({ example: 29900, description: 'Order total in smallest currency unit (paise). Server may compute/override.' })
  @IsOptional()
  @IsNumber()
  total?: number;

  @ApiPropertyOptional({ example: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string = 'INR';

  @ApiPropertyOptional({ enum: Object.values(PaymentMethodDto), example: PaymentMethodDto.RAZORPAY })
  @IsOptional()
  @IsEnum(PaymentMethodDto)
  paymentMethod?: PaymentMethodDto;

  @ApiPropertyOptional({ type: ShippingAddressDto, description: 'Shipping address (required for guest checkout)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ example: 'jane@example.com' })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

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
