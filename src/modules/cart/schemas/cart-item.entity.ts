import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '../../products/schemas/product.entity';
import { Cart } from './cart.entity';

@Schema({ timestamps: true })
export class CartItem extends Document {
    @Prop({ type: String, default: uuidv4 })
    id: string;

    @Prop({ type: Types.ObjectId, ref: 'Cart', required: true })
    cart: Cart | Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    product: Product | Types.ObjectId;

    @Prop({ type: Number, required: true, min: 1 })
    quantity: number;
}

export type CartItemDocument = CartItem & Document;

export const CartItemSchema = SchemaFactory.createForClass(CartItem);
