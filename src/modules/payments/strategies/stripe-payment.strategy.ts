import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stripe } from 'stripe';
import { IPaymentStrategy } from './payment-strategy.interface';
import { Order } from '../../orders/schemas/order.entity';
import { Payment, PaymentMethod, PaymentStatus } from '../schemas/payment.entity';

@Injectable()
export class StripePaymentStrategy implements IPaymentStrategy {
    private stripe: Stripe;

    constructor(
        @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
        private readonly configService: ConfigService,
    ) {
        const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        this.stripe = new Stripe(stripeKey, { apiVersion: '2025-09-30.clover' } as any);
    }

    async createPayment(order: Order): Promise<Payment> {
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(order.total * 100),
            currency: 'usd',
            metadata: { orderId: order._id.toString() },
        });

        return await this.paymentModel.create({
            paymentIntentId: paymentIntent.id,
            order: order._id,
            amount: order.total,
            currency: 'usd',
            status: PaymentStatus.PENDING,
            paymentMethod: PaymentMethod.STRIPE
        });
    }

    async processPayment(paymentId: string): Promise<Payment> {
        // Implement Stripe-specific payment processing
        return null;
    }

    async handleWebhook(event: Stripe.Event): Promise<void> {
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            await this.paymentModel.findOneAndUpdate(
                { paymentIntentId: paymentIntent.id },
                {
                    status: PaymentStatus.SUCCEEDED,
                    paymentDetails: {
                        type: paymentIntent.payment_method_types[0],
                        // last4: paymentIntent.payment_method_details?.card?.last4,
                        // brand: paymentIntent.payment_method_details?.card?.brand,
                    }
                }
            );
        }
    }
}