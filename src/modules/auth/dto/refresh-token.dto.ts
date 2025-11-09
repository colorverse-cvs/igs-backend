import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
    @IsNotEmpty()
    @ApiProperty({ example: 'uuid', description: 'User id' })
    @IsString()
    userId: string;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...', description: 'Refresh token' })
    @IsString()
    refreshToken: string;
}
