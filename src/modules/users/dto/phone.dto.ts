import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

export class PhoneDto {
  @ApiProperty({ example: '+919876543210', description: 'Indian mobile number in E.164 format (+91XXXXXXXXXX)' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+91[6-9]\d{9}$/, { message: 'Invalid Indian mobile number. Use E.164: +91XXXXXXXXXX' })
  number: string;

  @ApiPropertyOptional({ example: '+91', description: 'Country code' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional({ example: true, description: 'Mark as primary number' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Whether the number is verified' })
  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @ApiPropertyOptional({ example: 'mobile', enum: ['mobile', 'home', 'work', 'other'] })
  @IsOptional()
  @IsIn(['mobile', 'home', 'work', 'other'])
  label?: 'mobile' | 'home' | 'work' | 'other';
}