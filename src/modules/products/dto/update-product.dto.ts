import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
    @ApiPropertyOptional({
        example: 'Smartphone Pro',
        description: 'Updated product name (optional)',
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({
        example: 'Upgraded version with 256GB storage.',
        description: 'Updated product description (optional)',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        example: 799.99,
        description: 'Updated product price (optional)',
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    price?: number;

    @ApiPropertyOptional({
        example: 'ELEC-12345-PRO',
        description: 'Updated SKU (optional)',
    })
    @IsOptional()
    @IsString()
    sku?: string;

    @ApiPropertyOptional({
        example: 100,
        description: 'Updated quantity available (optional)',
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    quantity?: number;

    @ApiPropertyOptional({
        example: 2,
        description: 'Updated category ID (optional)',
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    categoryId?: string;
}
