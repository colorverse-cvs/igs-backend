import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type ShipmentDocument = Shipment & Document;

export enum ShipmentStatus {
    PENDING = 'pending',
    CREATED = 'created',
    IN_TRANSIT = 'in_transit',
    OUT_FOR_DELIVERY = 'out_for_delivery',
    DELIVERED = 'delivered',
    FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Shipment {
    @Prop({ type: String, default: uuidv4, })
    id: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true })
    order: mongoose.Types.ObjectId;

    @Prop({ required: true })
    carrier: string; // e.g. 'bluedart'

    @Prop()
    trackingId?: string;

    @Prop({ enum: ShipmentStatus, default: ShipmentStatus.PENDING })
    status: ShipmentStatus;

    @Prop()
    estimatedDelivery?: Date;

    @Prop({ type: Array, default: [] })
    history: Array<{
        status: string;
        location?: string;
        timestamp?: Date;
        raw?: any;
    }>;

    @Prop({ type: Object })
    rawResponse?: any;
}

export const ShipmentSchema = SchemaFactory.createForClass(Shipment);