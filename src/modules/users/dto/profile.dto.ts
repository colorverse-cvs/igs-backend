// src/users/dto/profile.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

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
}
