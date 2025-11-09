import { IsNotEmpty, IsNumber, IsString, IsOptional, IsArray, IsUrl, ValidateNested, IsBoolean, IsISO8601, IsIn, IsObject, } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ImageDto {
  @ApiProperty({ example: 'https://cdn.example.com/abc.jpg' })
  @IsUrl({}, { message: 'Image url must be a valid URL' })
  url: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/abc-thumb.jpg' })
  @IsOptional()
  @IsUrl({}, { message: 'thumbnail must be a valid URL' })
  thumbnail?: string;

  @ApiPropertyOptional({ example: 'Front view' })
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  position?: number;

  @ApiPropertyOptional({ description: 'Arbitrary small metadata (filename, mime, storageKey)' })
  @IsOptional()
  @IsObject()
  meta?: Record<string, string>;
}

export class DimensionsDto {
  @ApiPropertyOptional({ example: 30, description: 'length in cm' })
  @IsOptional()
  @IsNumber()
  length?: number;

  @ApiPropertyOptional({ example: 20, description: 'width in cm' })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiPropertyOptional({ example: 10, description: 'height in cm' })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ example: 12, description: 'diameter in cm (for round items)' })
  @IsOptional()
  @IsNumber()
  diameter?: number;

  @ApiPropertyOptional({ example: 6, description: 'size in inches (primary for UI filters)' })
  @IsOptional()
  @IsNumber()
  sizeInInches?: number;

  @ApiPropertyOptional({
    example: 'small',
    enum: ['small', 'medium', 'large', 'one-size'],
  })
  @IsOptional()
  @IsIn(['small', 'medium', 'large', 'one-size'])
  sizeCategory?: 'small' | 'medium' | 'large' | 'one-size';

  @ApiPropertyOptional({ example: 'cm' })
  @IsOptional()
  @IsString()
  unit?: string;
}

export class CreateProductDto {
  @ApiProperty({
    example: 'Wireless Mouse',
    description: 'Product name',
  })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: 'A high-precision wireless mouse with ergonomic design',
  })
  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @ApiProperty({ example: 1299.99 })
  @IsNotEmpty()
  @IsNumber()
  readonly price: number;

  @ApiPropertyOptional({ example: 1499.99 })
  @IsOptional()
  @IsNumber()
  readonly listPrice?: number;

  @ApiPropertyOptional({ example: 'INR' })
  @IsOptional()
  @IsString()
  readonly currency?: string;

  @ApiProperty({ example: 'MOUSE-123' })
  @IsNotEmpty()
  @IsString()
  readonly sku: string;

  @ApiProperty({ example: 50 })
  @IsNotEmpty()
  @IsNumber()
  readonly quantity: number;

  @ApiProperty({ example: 'e1c5f42b-0f94-4a2c-937d-1c0a1ad4f5f9' })
  @IsNotEmpty()
  @IsString()
  readonly categoryId: string;

  @ApiPropertyOptional({
    type: [ImageDto],
    description: 'Array of image metadata',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  readonly images?: ImageDto[];

  @ApiPropertyOptional({ type: DimensionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  readonly dimensions?: DimensionsDto;

  @ApiPropertyOptional({ example: 0.5 })
  @IsOptional()
  @IsNumber()
  readonly weight?: number;

  @ApiPropertyOptional({ example: '2025-11-01T00:00:00Z' })
  @IsOptional()
  @IsISO8601()
  readonly availableFrom?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  readonly isCustomizable?: boolean;

  @ApiPropertyOptional({ example: ['decor', 'gifts'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly tags?: string[];

  @ApiPropertyOptional({ example: { color: 'red', material: 'marble' } })
  @IsOptional()
  @IsObject()
  readonly attributes?: Record<string, string>;
}
