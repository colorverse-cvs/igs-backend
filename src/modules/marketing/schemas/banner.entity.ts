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

  /**
   * Array of Instagram Reel IDs for marketing display.
   * e.g. ["CxYz1234567", "DaBC9876543"]
   */
  @Prop({ type: [String], default: [] })
  instagramReelIds: string[];
}

export type BannerDocument = Banner & Document;
export const BannerSchema = SchemaFactory.createForClass(Banner);
