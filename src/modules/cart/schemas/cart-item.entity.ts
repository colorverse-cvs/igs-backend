import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from '../../products/schemas/product.entity';
import { Cart } from './cart.entity';

@Schema()
export class CartItem extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Product | Types.ObjectId;

  @Prop({ type: Number, default: 1 })
  quantity: number;

  // make cart optional because CartItem will often be an embedded subdocument
  @Prop({ type: Types.ObjectId, ref: 'Cart', required: false, index: true })
  cart?: Cart | Types.ObjectId;
}
export const CartItemSchema = SchemaFactory.createForClass(CartItem);
export type CartItemDocument = CartItem & Document;
