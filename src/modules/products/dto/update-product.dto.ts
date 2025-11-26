import { IsNumber, IsOptional, IsString, IsArray, IsBoolean, IsISO8601, ValidateNested, IsObject, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ImageDto, DimensionsDto } from './create-product.dto';

export class UpdateProductDto {
    @ApiPropertyOptional({ example: 'Smartphone Pro' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: 'Upgraded version with 256GB storage.' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 799.99 })
    @IsOptional()
    @IsNumber()
    price?: number;

    @ApiPropertyOptional({ example: 899.99 })
    @IsOptional()
    @IsNumber()
    listPrice?: number;

    @ApiPropertyOptional({ example: 'INR' })
    @IsOptional()
    @IsString()
    currency?: string;

    @ApiPropertyOptional({ example: 5, minimum: 0, maximum: 100, description: 'Discount percentage (0-100)' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    discount?: number;

    @ApiPropertyOptional({ example: 'ELEC-12345-PRO' })
    @IsOptional()
    @IsString()
    sku?: string;

    @ApiPropertyOptional({ example: 100, description: 'Available stock quantity - gets reduced on order placement' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    stock?: number;

    @ApiPropertyOptional({ example: 100 })
    @IsOptional()
    @IsNumber()
    quantity?: number;

    @ApiPropertyOptional({ example: 'e1c5f42b-0f94-4a2c-937d-1c0a1ad4f5f9' })
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiPropertyOptional({
      type: 'array',
      items: {
        type: 'string',
        format: 'binary',
      },
      description: 'Array of image files (multipart upload, max 10 files)',
    })
    @IsOptional()
    readonly images?: Express.Multer.File[];

    @ApiPropertyOptional({ type: DimensionsDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => DimensionsDto)
    dimensions?: DimensionsDto;

    @ApiPropertyOptional({ example: 0.5 })
    @IsOptional()
    @IsNumber()
    weight?: number;

    @ApiPropertyOptional({ example: '2025-11-01T00:00:00Z' })
    @IsOptional()
    @IsISO8601()
    availableFrom?: string;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    isCustomizable?: boolean;

    @ApiPropertyOptional({ example: ['decor', 'gifts'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional({ example: { color: 'red', material: 'marble' } })
    @IsOptional()
    @IsObject()
    attributes?: Record<string, string>;
}
