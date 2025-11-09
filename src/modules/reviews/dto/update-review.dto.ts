import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    example: 4,
    description: 'Updated rating for the product (1–5)',
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    example: 'Good product but delivery was late.',
    description: 'Updated review comment',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
