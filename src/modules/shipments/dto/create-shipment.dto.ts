import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShipmentDto {
  @ApiProperty({ description: 'Preferred carrier (bluedart, fedex, ups). Default bluedart', required: false })
  @IsOptional()
  @IsString()
  carrier?: string;
}