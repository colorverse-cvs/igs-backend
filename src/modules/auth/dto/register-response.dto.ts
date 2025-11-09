import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';

export class UserResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    email: string;

    @ApiProperty({ enum: Role })
    role: Role;

    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;

    @ApiProperty()
    expiresIn: string;

    @ApiProperty()
    refreshExpiresInDays: number;
}
