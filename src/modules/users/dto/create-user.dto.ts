import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressDto } from './address.dto';
import { ProfileDto } from './profile.dto';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address (must be unique)',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ type: [AddressDto], required: false })
  @IsOptional()
  addresses?: AddressDto[];

  @ApiProperty({
    example: 'strongPassword123',
    description: 'User password (minimum 6 characters)',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'customer',
    description: "User role, e.g. 'admin' or 'customer'",
    enum: ['admin', 'customer'],
  })
  @IsNotEmpty()
  role: string;

  @ApiPropertyOptional({ type: [ProfileDto], required: false })
  @IsOptional()
  profile?: ProfileDto;
}
