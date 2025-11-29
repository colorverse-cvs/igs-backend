import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
// import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class Category extends Document {
  // @Prop({
  //   type: String,
  //   default: uuidv4, // UUID for id
  // })
  // id: string;

  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  // @Prop({ type: [String], ref: 'Product', default: [] })
  // products: string[];
}

export type CategoryDocument = Category & Document;
export const CategorySchema = SchemaFactory.createForClass(Category);