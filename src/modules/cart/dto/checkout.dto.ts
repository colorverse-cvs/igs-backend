// export class CheckoutDto {
//   paymentMethod: 'razorpay' | 'cod';
//   // if guest (no req.user) provide these:
//   name?: string;
//   email?: string;
//   phone?: string; // E.164 +91...
//   address?: {
//     line1: string;
//     line2?: string;
//     city: string;
//     state: string;
//     postalCode: string;
//     country?: string;
//   };
// }

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsPhoneNumber,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from 'src/modules/users/dto';


export class CheckoutDto {
  @ApiProperty({
    example: 'razorpay',
    enum: ['razorpay', 'cod'],
    description: 'Selected payment method',
  })
  @IsEnum(['razorpay', 'cod'])
  paymentMethod: 'razorpay' | 'cod';

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '+911234567890',
    description: 'Phone number in E.164 format',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber('IN')
  phone?: string;

  @ApiProperty({
    type: AddressDto,
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}
