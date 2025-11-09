// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// // import * as paypal from '@paypal/checkout-server-sdk';
// import { IPaymentStrategy } from './payment-strategy.interface';
// import { Order } from '../../orders/schemas/order.entity';
// import { Payment, PaymentMethod, PaymentStatus } from '../schemas/payment.entity';

// @Injectable()
// export class PayPalPaymentStrategy implements IPaymentStrategy {
//     private environment: paypal.core.SandboxEnvironment;
//     private client: paypal.core.PayPalHttpClient;

//     constructor(
//         @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
//         private readonly configService: ConfigService,
//     ) {
//     }
//     async createPayment(order: Order): Promise<Payment> {

//     }

//     async processPayment(paymentId: string): Promise<Payment> {
//         // Implement Stripe-specific payment processing
//         return null;
//     }

//     async handleWebhook(event: Event): Promise<void> {

//     }
// }