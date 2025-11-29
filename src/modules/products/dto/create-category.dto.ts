import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Electronics',
    description: 'The name of the category (must be unique)',
  })
  @IsNotEmpty({ message: 'Category name is required' })
  @IsString({ message: 'Category name must be a string' })
  readonly name: string;

  @ApiProperty({
    example: 'Description for the Electronics category',
    description: 'description of the category',
  })
  @IsString({ message: 'Description name must be a string' })
  readonly description: string;
}
