import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Order } from './order.entity';
import { Product } from '../../products/schemas/product.entity';

@Schema()
export class OrderItem extends Document {
  @Prop({ type: String, default: uuidv4, unique: true })
  id: string;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order: Order;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Product;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: Number, required: true })
  price: number;
}

export type OrderItemDocument =  OrderItem & Document;

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
