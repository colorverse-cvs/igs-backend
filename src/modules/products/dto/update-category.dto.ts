import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: 'Home Appliances',
    description: 'Updated category name',
  })
  @IsOptional()
  @IsString({ message: 'Category name must be a string' })
  readonly name?: string;

  @ApiPropertyOptional({
    example: 'home-appliances',
    description: 'Slug for category (optional)',
  })
  @IsOptional()
  @IsString()
  readonly slug?: string;

  @ApiPropertyOptional({
    example: 'Kitchen and home electrical appliances',
    description: 'Category description',
  })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
    description: 'Parent category UUID (optional)',
  })
  @IsOptional()
  @IsString()
  readonly parentId?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the category is active',
  })
  @IsOptional()
  @IsBoolean()
  readonly active?: boolean;
}
