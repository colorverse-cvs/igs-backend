import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Category } from './category.entity';

@Schema()
class Image {
  @Prop({ type: String, required: true })
  url: string; // CDN/S3 url

  @Prop({ type: String })
  thumbnail?: string; // small/thumb url

  @Prop({ type: String })
  alt?: string;

  @Prop({ type: Boolean, default: false })
  isPrimary?: boolean;

  @Prop({ type: Number, default: 0 })
  position?: number;

  @Prop({ type: Map, of: String, default: {} })
  meta?: Map<string, string>; // original filename, storageKey, size, mime, etc.
}

export type ImageDocument = Image & Document;
export const ImageSchema = SchemaFactory.createForClass(Image);

@Schema()
class Dimensions {
  // keep raw metric measurements (cm) for storage and conversions
  @Prop({ type: Number })
  length?: number; // cm

  @Prop({ type: Number })
  width?: number; // cm

  @Prop({ type: Number })
  height?: number; // cm

  @Prop({ type: Number })
  diameter?: number; // cm, useful for round items

  // primary size used by UI filters (in inches)
  @Prop({ type: Number })
  sizeInInches?: number;

  // categories matching your screenshot filters:
  // small: under 6 in, medium: 6 - 10 in, large: above 10 in
  @Prop({ type: String, enum: ['small', 'medium', 'large', 'one-size'], default: 'one-size', index: true })
  sizeCategory?: 'small' | 'medium' | 'large' | 'one-size';

  @Prop({ type: String, default: 'cm' })
  unit?: string;
}

export type DimensionsDocument = Dimensions & Document;

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ type: String, default: uuidv4, unique: true })
  id: string;

  @Prop({ type: String, required: true, index: true })
  name: string;

  @Prop({ type: String, index: true, unique: true, sparse: true })
  slug?: string;

  // store metadata/URLs only
  @Prop({ type: [ImageSchema], default: [] })
  images: Image[]; // urls + metadata

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Number, required: true })
  price: number; // current selling price

  @Prop({ type: Number })
  listPrice?: number; // original / MRP

  @Prop({ type: String, default: 'INR' })
  currency?: string;

  @Prop({ type: String, required: true, unique: true })
  sku: string;

  @Prop({ type: Number, default: 0 })
  quantity: number;

  @Prop({ type: Boolean, default: true })
  inStock: boolean;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: Boolean, default: false })
  isCustomizable: boolean;

  @Prop({ type: [String], default: [], index: true })
  tags: string[];

  @Prop({ type: Map, of: String, default: {} })
  attributes: Map<string, string>; // e.g. color -> red, material -> wood

  @Prop({ type: Number, default: 0 })
  rating: number; // average rating

  @Prop({ type: Number, default: 0 })
  reviewsCount: number;

  @Prop({ type: String, enum: ['active', 'draft', 'archived'], default: 'active', index: true })
  status: string;

  // Reference by UUID instead of ObjectId
  @Prop({ type: String, ref: 'Category', required: true })
  category: string | Category;

  @Prop({ type: Dimensions })
  dimensions?: Dimensions;

  @Prop({ type: Number })
  weight?: number;

  @Prop({ type: Date })
  availableFrom?: Date;
}

export type ProductDocument = Product & Document;
export const ProductSchema = SchemaFactory.createForClass(Product);
export const DimensionsSchema = SchemaFactory.createForClass(Dimensions);
