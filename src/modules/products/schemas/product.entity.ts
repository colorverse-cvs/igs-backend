import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Category } from './category.entity';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({
    type: String,
    default: uuidv4, // Use UUID as _id
  })
  id: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: String, required: true, unique: true })
  sku: string;

  @Prop({ type: Number, default: 0 })
  quantity: number;

  // Reference by UUID instead of ObjectId
  @Prop({ type: String, ref: 'Category', required: true })
  category: string | Category;
}

export type ProductDocument = Product & Document;
export const ProductSchema = SchemaFactory.createForClass(Product);
