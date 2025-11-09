import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../users/schemas/user.entity';
import { Product } from '../../products/schemas/product.entity';


@Schema({ timestamps: true })
export class Review {
    @Prop({ default: () => uuidv4() })
    id: string;

    @Prop({ required: true, min: 1, max: 5 })
    rating: number;

    @Prop({ required: true, trim: true })
    comment: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: User | Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    product: Product | Types.ObjectId;
}

export type ReviewDocument = Review & Document;
export const ReviewSchema = SchemaFactory.createForClass(Review);
