import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example: 5,
    description: 'Rating for the product (1–5)',
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'Excellent quality and fast shipping!',
    description: 'Customer feedback about the product',
  })
  @IsNotEmpty()
  @IsString()
  comment: string;

  @ApiProperty({
    example: '64fbe9e44e17c3e123456789',
    description: 'The ID of the product being reviewed',
  })
  @IsNotEmpty()
  @IsString()
  productId: string;
}
