import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../schemas/payment.entity';

export class CreatePaymentDto {
    @ApiProperty({
        enum: PaymentMethod,
        description: 'Payment method (stripe or cod)'
    })
    @IsEnum(PaymentMethod)
    @IsNotEmpty()
    paymentMethod: PaymentMethod;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    orderId: string;
}