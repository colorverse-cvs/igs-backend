import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// import { v4 as uuidv4 } from 'uuid';
import { User } from '../../users/schemas/user.entity';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Order extends Document {
  // @Prop({ type: String, default: uuidv4, unique: true })
  // id: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({
    type: String,
    enum: ['placed', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'placed',
  })
  status: string;

  @Prop({ type: Number, required: true })
  total: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'OrderItem' }] })
  items: Types.ObjectId[];
}

export type OrderDocument =  Order & Document;

export const OrderSchema = SchemaFactory.createForClass(Order);
