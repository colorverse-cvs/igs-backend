import { IsArray, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressDto } from './address.dto';
import { ProfileDto } from './profile.dto';
import { PhoneDto } from './phone.dto';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'newPassword456',
    description: 'Updated password (minimum 6 characters)',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ type: [AddressDto], required: false })
  @IsOptional()
  addresses?: AddressDto[];

  @ApiPropertyOptional({ type: [ProfileDto], required: false })
  @IsOptional()
  profile?: ProfileDto;

  @ApiPropertyOptional({ type: [PhoneDto], description: 'Phone numbers (India format). Use isPrimary to mark primary.' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhoneDto)
  phones?: PhoneDto[];
}
