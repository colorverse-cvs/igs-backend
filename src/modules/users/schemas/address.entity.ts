import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AddressDocument = Address & Document;

@Schema()
export class Address {
    @Prop({ required: true }) line1: string;
    @Prop() line2?: string;
    @Prop() line3?: string;
    @Prop({ required: true }) city: string;
    @Prop() state?: string;
    @Prop({ required: true }) postalCode: string;
    @Prop({ required: true }) country: string;
    @Prop() phone?: string;
    @Prop({ default: false }) isDefault?: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
