import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../orders/schemas/order.entity';
import { Payment, PaymentMethod, PaymentStatus } from './schemas/payment.entity';
import { PaymentFactoryService } from './factories/payment-factory.service';
import { RazorpayVerifyDto } from './dto/razorpay-verify.dto';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';
import { CLEAR_CART, PAYMENT_SUCCEEDED } from 'src/common/events';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectModel(Order.name) private readonly orderModel: Model<Order>,
        @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
        private readonly configService: ConfigService,
        private readonly paymentFactory: PaymentFactoryService,
        private readonly ordersService: OrdersService,
        private readonly eventEmitter: EventEmitter2
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

    async getTransactions(page: number, limit: number): Promise<{ payments: Payment[]; total: number; pages: number }> {
        const payments = await this.paymentModel.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec();
        const total = await this.paymentModel.countDocuments().exec();
        const pages = Math.ceil(total / limit);
        return { payments, total, pages };
    }

    async handleWebhook(paymentMethod: PaymentMethod, payload: any): Promise<void> {
        const paymentStrategy = this.paymentFactory.getStrategy(paymentMethod);
        if (paymentStrategy.handleWebhook) {
            await paymentStrategy.handleWebhook(payload);
        }
    }

    async verifyPayment(body: RazorpayVerifyDto, userId: string) {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;
        const secret = this.configService.get<string>('app.razorpay.keySecret');
        const paymentStrategy = this.paymentFactory.getStrategy('razorpay' as any);
        if (!secret) {
            throw new InternalServerErrorException('Razorpay webhook secret is missing in configuration',);
        }
        const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
        const isVerified = await (paymentStrategy as any).verifySignature(payload, razorpay_signature);
        if (!isVerified) {
            throw new BadRequestException('Payment verification failed');
        }
        const details = await (paymentStrategy as any).captureAndGetMethod(razorpay_payment_id);
        const payment = await this.paymentModel.findOneAndUpdate(
            { paymentIntentId: razorpay_order_id },
            {
                status: PaymentStatus.SUCCEEDED,
                paymentDetails: {
                    razorpayPaymentId: razorpay_payment_id,
                    verifiedAt: new Date(),
                    ...details
                },
            },
            { new: true },
        );
        if (!payment) {
            throw new BadRequestException('Payment record not found');
        }
        const order = await this.ordersService.findOrderByRazorpayOrderId(razorpay_order_id);
        if (order) {
            await this.ordersService.markAsPlaced(order._id.toString());
            this.eventEmitter.emit(CLEAR_CART, {
                userId: order.user.toString(),
                sessionId: order.sessionId,
            });
        }

        return {
            message: 'Payment verified successfully'
        };
    }

    async refundOrder(orderId: string) {
        const order = await this.ordersService.findOrderById(orderId);
        if (!order) throw new NotFoundException('Order not found');
        if (order.status !== 'cancelled') {
            throw new BadRequestException('Only cancelled orders can be refunded');
        }

        const payment = await this.paymentModel.findOne({
            order: order._id,
            status: PaymentStatus.SUCCEEDED,
        });

        if (!payment) {
            throw new BadRequestException('No successful payment found for this order');
        }

        // ✅ pick strategy based on payment method
        const strategy = this.paymentFactory.getStrategy(
            payment.paymentMethod as PaymentMethod,
        );

        // 🔁 delegate refund to gateway
        const refund = await strategy.refundPayment(payment);

        // ✅ Update payment
        payment.status = PaymentStatus.REFUNDED;
        payment.paymentDetails = {
            ...payment.paymentDetails,
            refundId: refund.id,
            refundedAt: new Date(),
        };
        await payment.save();

        // ✅ Update order history
        await this.ordersService.pushHistory(order._id, {
            status: 'refunded',
            reason: 'Refund processed by admin',
            at: new Date(),
        });
        return {
            message: 'Refund processed successfully',
            refund,
        };
    }



}
