// src/users/dto/profile.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export enum Gender {
  Male = 'male',
  Female = 'female',
  NonBinary = 'non-binary',
  Other = 'other',
  PreferNotToSay = 'prefer-not-to-say',
}

export class ProfileDto {
  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', description: 'Profile image URL' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Display name for user' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ example: 'Short bio about the user' })
  @IsOptional()
  @IsString()
  bio?: string;


  @ApiPropertyOptional({ example: 'female', enum: Object.values(Gender), description: 'Gender of the user' })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: '23/04/2000', description: 'Date of birth in ISO 8601 format (DD/MM/YYYY)' })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiProperty({ example: '+919876543210', description: 'Indian mobile number in E.164 format (+91XXXXXXXXXX)' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+91[6-9]\d{9}$/, { message: 'Invalid Indian mobile number. Use E.164: +91XXXXXXXXXX' })
  mobile: string;
}
