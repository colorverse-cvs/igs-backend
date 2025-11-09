import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: 'Home Appliances',
    description: 'Updated category name',
  })
  @IsOptional()
  @IsString({ message: 'Category name must be a string' })
  readonly name?: string;
}
