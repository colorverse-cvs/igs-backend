import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// import { v4 as uuidv4 } from 'uuid';
import { User } from '../../users/schemas/user.entity';
import { CartItem, CartItemSchema } from './cart-item.entity';

@Schema({ timestamps: true })
export class Cart extends Document {
    // @Prop({ type: String, default: uuidv4 })
    // id: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: false , index: true})
    user?: User | Types.ObjectId;

    // @Prop({ type: [{ type: Types.ObjectId, ref: 'CartItem' }], default: [] })
    // items: CartItem[] | Types.ObjectId[];

    @Prop({ type: String, required: false, index: true })
    sessionId?: string; 

    @Prop({ type: [CartItemSchema], default: [] })
    items: Types.DocumentArray<CartItem>;
}

export type CartDocument = Cart & Document;
export const CartSchema = SchemaFactory.createForClass(Cart);
CartSchema.index({ sessionId: 1 }, { sparse: true });
CartSchema.index({ user: 1 }, { sparse: true });
