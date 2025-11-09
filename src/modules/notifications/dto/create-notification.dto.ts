import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'The message content of the notification',
    example: 'Your course has been approved!',
  })
  @IsString()
  @MinLength(3)
  message: string;
}
