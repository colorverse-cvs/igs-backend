import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPaymentStrategy } from './payment-strategy.interface';
import { Order } from '../../orders/schemas/order.entity';
import { Payment, PaymentMethod, PaymentStatus } from '../schemas/payment.entity';


@Injectable()
export class CodPaymentStrategy implements IPaymentStrategy {
    constructor(
        @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    ) {}

    async createPayment(order: Order): Promise<Payment> {
        const codReference = `COD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        return await this.paymentModel.create({
            order: order._id,
            amount: order.total,
            currency: 'usd',
            status: PaymentStatus.PENDING,
            paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
            paymentDetails: {
                codReference
            }
        });
    }

    async processPayment(paymentId: string): Promise<Payment> {
        return await this.paymentModel.findByIdAndUpdate(
            paymentId,
            { status: PaymentStatus.SUCCEEDED },
            { new: true }
        );
    }
}