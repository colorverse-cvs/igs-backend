import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Banner extends Document {
  /**
   * Public URL of the banner image, e.g. /public/banners/uuid.jpg
   * Null when no image has been uploaded yet.
   */
  @Prop({ type: String, default: null })
  imageUrl: string | null;

  /**
   * Stored filename on disk (used for fs.unlink on delete/replace).
   * Null when no image has been uploaded yet.
   */
  @Prop({ type: String, default: null })
  imageFilename: string | null;

  /**
   * Array of promotional strip text items.
   * e.g. ["Welcome to our website", "Check out our new features"]
   */
  @Prop({ type: [String], default: [] })
  texts: string[];
}

export type BannerDocument = Banner & Document;
export const BannerSchema = SchemaFactory.createForClass(Banner);
