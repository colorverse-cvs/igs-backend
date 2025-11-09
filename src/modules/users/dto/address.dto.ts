import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class AddressDto {
  @ApiProperty({ example: '123 Main St', description: 'Primary address line' })
  @IsString()
  line1!: string;

  @ApiPropertyOptional({ example: 'Apt 4B', description: 'Secondary address line (optional)' })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ example: 'Pune', description: 'City name' })
  @IsString()
  city!: string;

  @ApiPropertyOptional({ example: 'MH', description: 'State or province' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '441446', description: 'Postal or ZIP code' })
  @IsString()
  postalCode!: string;

  @ApiProperty({ example: 'India', description: 'Country name' })
  @IsString()
  country!: string;

  @ApiPropertyOptional({ example: '+919999999999', description: 'Phone number associated with address' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether this address is the default one' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
