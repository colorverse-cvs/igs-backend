import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../users/schemas/user.entity';
import { Product } from '../../products/schemas/product.entity';

export type WishlistDocument = Wishlist & Document;

@Schema({ timestamps: true })
export class Wishlist {
    @Prop({ default: () => uuidv4() })
    id: string;
    
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: User | Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    product: Product | Types.ObjectId;
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);
