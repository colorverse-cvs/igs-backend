import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../users/schemas/user.entity';


@Schema({ timestamps: true })
export class Notification extends Document {
    @Prop({ default: () => uuidv4() })
    id: string;

    @Prop({ required: true })
    message: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: User | Types.ObjectId;

    @Prop({ default: false })
    read: boolean;
}

export type NotificationDocument = Notification & Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
