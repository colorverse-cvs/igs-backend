import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto { 
  @ApiProperty({
    example: 'a1b2c3d4e5',
    description: 'The reset password token sent via email',
  })
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'The new password the user wants to set',
  })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
