import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// import { v4 as uuidv4 } from 'uuid';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ timestamps: true })
export class RefreshToken {
    // @Prop({ type: String, default: uuidv4, unique: true })
    // id: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    // hashed token
    @Prop({ required: true })
    token: string;

    // optional metadata (ip, userAgent) can be added later
    @Prop()
    ip?: string;

    @Prop()
    userAgent?: string;

    @Prop({ required: true })
    expiresAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
