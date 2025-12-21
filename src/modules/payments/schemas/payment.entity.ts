import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
// import { v4 as uuidv4 } from 'uuid';
import { Order } from '../../orders/schemas/order.entity';

export enum PaymentMethod {
    STRIPE = 'stripe',
    CASH_ON_DELIVERY = 'cod',
    RAZORPAY = 'razorpay',
}

export enum PaymentStatus {
  CREATED = 'created',          // Order created but no payment attempt yet
  PENDING = 'pending',          // Payment initiated, waiting for confirmation
  REQUIRES_ACTION = 'requires_action', // OTP / 3D secure required (future-use)
  SUCCEEDED = 'succeeded',      // Payment captured successfully
  FAILED = 'failed',            // Payment attempt failed
  CANCELLED = 'cancelled',      // User canceled before payment
  REFUNDED = 'refunded',        // Fully refunded
  PARTIALLY_REFUNDED = 'partially_refunded', // Partial refund support
  DISPUTED = 'disputed',        // Chargeback/dispute raised
  EXPIRED = 'expired',           // Payment not completed in time
  CAPTURED = 'captured',        // 'CAPTURED' means the payment has been successfully charged and the amount
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
        refundId?: string;
        refundedAt?: Date;
    };
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);