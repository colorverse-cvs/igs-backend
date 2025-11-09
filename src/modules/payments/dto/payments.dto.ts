import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsOptional } from 'class-validator';

export class PaymentIntentResponseDto {
  @ApiProperty({
    example: 'pi_3Pxxx',
    description: 'Unique identifier for the payment intent',
  })
  @IsString()
  id: string;

  @ApiProperty({
    example: 12000,
    description: 'Amount in cents (100 = $1)',
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 'usd',
    description: 'Currency used for the payment',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    example: 'requires_payment_method',
    description: 'Current status of the payment intent',
  })
  @IsString()
  status: string;

  @ApiProperty({
    example: 'pi_3Pxxx_secret_12345',
    description: 'Client secret used on the frontend to confirm payment',
  })
  @IsString()
  client_secret: string;
}

export class StripeWebhookEventDto {
  @ApiProperty({
    example: 'evt_1Pxxxx',
    description: 'Stripe event unique ID',
  })
  @IsString()
  id: string;

  @ApiProperty({
    example: 'payment_intent.succeeded',
    description: 'Type of Stripe event',
  })
  @IsString()
  type: string;

  @ApiProperty({
    example: {
      object: {
        id: 'pi_3Pxxx',
        amount: 12000,
        status: 'succeeded',
        metadata: { orderId: 'abc123' },
      },
    },
    description: 'The event payload data from Stripe',
  })
  @IsObject()
  data: Record<string, any>;
}
