import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// import { v4 as uuidv4 } from 'uuid';
import { Order } from './order.entity';
import { Product } from '../../products/schemas/product.entity';

@Schema()
export class OrderItem extends Document {
  // @Prop({ type: String, default: uuidv4, unique: true })
  // id: string;

  // make order optional because items are created before attaching to an order
  @Prop({ type: Types.ObjectId, ref: 'Order', required: false, index: true })
  order?: Order | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Product | Types.ObjectId;

  @Prop({ type: Number, required: true })
  quantity: number;

  // price for this item (in base currency unit, e.g. rupees) or store smallest unit consistency with Order.total
  @Prop({ type: Number, required: true })
  price: number;
}

export type OrderItemDocument = OrderItem & Document;

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
