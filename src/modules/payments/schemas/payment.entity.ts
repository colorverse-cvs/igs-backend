import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
// import { v4 as uuidv4 } from 'uuid';
import { Order } from '../../orders/schemas/order.entity';

export enum PaymentMethod {
    STRIPE = 'stripe',
    CASH_ON_DELIVERY = 'cod'
}

export enum PaymentStatus {
    PENDING = 'pending',
    SUCCEEDED = 'succeeded',
    FAILED = 'failed',
    REFUNDED = 'refunded'
}

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {

    // @Prop({ type: String, default: uuidv4, })
    // id: string;

    @Prop({ required: true })
    paymentIntentId?: string;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Order' })
    order: Order;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: true })
    currency: string;

    @Prop({
        required: true,
        enum: PaymentStatus,
        default: PaymentStatus.PENDING
    })
    status: PaymentStatus;

    @Prop({
        required: true,
        enum: PaymentMethod,
        default: PaymentMethod.STRIPE
    })
    paymentMethod: PaymentMethod;

    @Prop({ type: Object })
    paymentDetails?: {
        type?: string;
        last4?: string;
        brand?: string;
        codReference?: string;
    };
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);