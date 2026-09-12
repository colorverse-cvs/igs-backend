import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayNotEmpty, IsNotEmpty, IsOptional } from 'class-validator';

export class AddInstagramReelsDto {
  @ApiProperty({
    description: 'One or more Instagram Reel IDs to add',
    example: ['CxYz1234567', 'DaBC9876543'],
    isArray: true,
    type: String,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  reelIds: string[];
}
