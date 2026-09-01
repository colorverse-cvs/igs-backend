import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddTextsDto {
  @ApiProperty({
    description: 'One or more promotional strip text items to add',
    example: [
      'Welcome to our website',
      'Latest updates are available',
      'Check out our new features',
    ],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  texts: string[];
}
