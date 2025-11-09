import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Shipment, ShipmentSchema } from './schemas/shipment.entity';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { BlueDartService } from './blue-dart.service';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from '../orders/orders.module';

@Module({
    imports: [
        ConfigModule,
        MongooseModule.forFeature([
            { name: Shipment.name, schema: ShipmentSchema },
        ]),
        OrdersModule,
    ],
    providers: [ShipmentsService, BlueDartService],
    controllers: [ShipmentsController],
    exports: [ShipmentsService, MongooseModule],
})
export class ShipmentsModule { }