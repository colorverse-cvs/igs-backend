// src/users/dto/profile.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

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
}
