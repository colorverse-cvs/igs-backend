import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// import { v4 as uuidv4 } from 'uuid';
import { User } from '../../users/schemas/user.entity';

@Schema({ timestamps: true })
export class Order extends Document {
  // @Prop({ type: String, default: uuidv4, unique: true })
  // id: string;

  // user optional to support guest orders
  @Prop({ type: Types.ObjectId, ref: 'User', required: false, index: true })
  user?: User;

  // order lifecycle: pending -> placed -> shipped -> delivered
  @Prop({
    type: String,
    enum: ['pending', 'placed', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
    index: true,
  })
  status: string;

  // total in smallest currency unit (e.g. paise)
  @Prop({ type: Number, required: true })
  total: number;

  // currency like 'INR'
  @Prop({ type: String, default: 'INR' })
  currency?: string;

  // payment method used/selected
  @Prop({ type: String, required: false })
  paymentMethod?: string;

  // provider-specific metadata (e.g. razorpayOrderId, refund ids)
  @Prop({ type: Object, default: {} })
  paymentMeta?: Record<string, any>;

  // guest customer info (if user is not set)
  @Prop({ type: Object, required: false })
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    shippingAddress?: any;
  };

  // optional linkage to cart/session for traceability
  @Prop({ type: String, required: false, index: true })
  cartId?: string;

  @Prop({ type: String, required: false, index: true })
  sessionId?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'OrderItem' }] })
  items: Types.ObjectId[];

  @Prop({ type: [{ status: String, changedBy: { type: Types.ObjectId, ref: 'User' }, reason: String, at: Date }], default: [] })
  history?: { status: string; changedBy?: Types.ObjectId; reason?: string; at?: Date }[];
}

export type OrderDocument = Order & Document;

export const OrderSchema = SchemaFactory.createForClass(Order);
