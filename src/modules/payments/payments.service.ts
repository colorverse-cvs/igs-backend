import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../orders/schemas/order.entity';
import { Payment, PaymentMethod } from './schemas/payment.entity';
import { PaymentFactoryService } from './factories/payment-factory.service';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectModel(Order.name) private readonly orderModel: Model<Order>,
        private readonly paymentFactory: PaymentFactoryService,
    ) {}

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
}
