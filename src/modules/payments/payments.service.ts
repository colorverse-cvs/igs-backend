import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../orders/schemas/order.entity';
import { Payment, PaymentMethod, PaymentStatus } from './schemas/payment.entity';
import { PaymentFactoryService } from './factories/payment-factory.service';
import { RazorpayVerifyDto } from './dto/razorpay-verify.dto';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectModel(Order.name) private readonly orderModel: Model<Order>,
        @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
        private readonly configService: ConfigService,
        private readonly paymentFactory: PaymentFactoryService,
    ) { }

    async createPayment(orderId: string, paymentMethod: PaymentMethod): Promise<Payment> {
        const order = await this.orderModel
            .findById(orderId)
            .populate('user')
            .populate({ path: 'items', populate: { path: 'product' } })
            .exec();

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const paymentStrategy = this.paymentFactory.getStrategy(paymentMethod);
        return await paymentStrategy.createPayment(order);
    }

    async processPayment(paymentId: string, paymentMethod: PaymentMethod): Promise<Payment> {
        const paymentStrategy = this.paymentFactory.getStrategy(paymentMethod);
        return await paymentStrategy.processPayment(paymentId);
    }

    async handleWebhook(paymentMethod: PaymentMethod, payload: any): Promise<void> {
        const paymentStrategy = this.paymentFactory.getStrategy(paymentMethod);
        if (paymentStrategy.handleWebhook) {
            await paymentStrategy.handleWebhook(payload);
        }
    }

    async verifyPayment(body: RazorpayVerifyDto) {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, } = body;
        const secret = this.configService.get<string>('app.razorpay.webhookSecret');

        if (!secret) {
            throw new InternalServerErrorException('Razorpay webhook secret is missing in configuration',);
        }

        // 1️⃣ Generate signature
        const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        // 2️⃣ Validate signature
        if (generatedSignature !== razorpay_signature) {
            throw new BadRequestException('Payment verification failed');
        }
        // 3️⃣ Update payment record
        const payment = await this.paymentModel.findOneAndUpdate(
            { paymentIntentId: razorpay_order_id },
            {
                status: PaymentStatus.SUCCEEDED,
                paymentDetails: {
                    razorpayPaymentId: razorpay_payment_id,
                    verifiedAt: new Date(),
                },
            },
            { new: true },
        );

        if (!payment) {
            throw new BadRequestException('Payment record not found');
        }
        return {
            message: 'Payment verified successfully',
            payment,
        };
    }

}
