import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Shipment, ShipmentSchema } from './schemas/shipment.entity';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { BlueDartService } from './blue-dart.service';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from '../orders/orders.module';
import { Order, OrderSchema } from '../orders/schemas/order.entity';

@Module({
    imports: [
        ConfigModule,
        MongooseModule.forFeature([
            { name: Shipment.name, schema: ShipmentSchema },
            { name: Order.name, schema: OrderSchema },
        ]),
        OrdersModule,
    ],
    providers: [ShipmentsService, BlueDartService],
    controllers: [ShipmentsController],
    exports: [ShipmentsService, MongooseModule],
})
export class ShipmentsModule { }


// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { ShipmentsService } from './shipments.service';
// import { ShipmentsController } from './shipments.controller';
// import { Shipment, ShipmentSchema } from './schemas/shipment.entity';
// import { BlueDartService } from './blue-dart.service';
// import { Order, OrderSchema } from '../orders/schemas/order.entity';

// @Module({
//   imports: [
//     MongooseModule.forFeature([
//       { name: Shipment.name, schema: ShipmentSchema },
//       { name: Order.name, schema: OrderSchema },
//     ]),
//   ],
//   controllers: [ShipmentsController],
//   providers: [ShipmentsService, BlueDartService],
//   exports: [ShipmentsService],
// })
// export class ShipmentsModule {}