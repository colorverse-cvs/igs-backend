import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.entity';
import { OrderItem, OrderItemSchema } from './schemas/order-item.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
// import { PaymentsService } from '../payments/payments.service';
// import { InvoicesService } from '../invoices/invoices.service';
// import { PaymentsController } from '../payments/payments.controller';
// import { InvoicesController } from '../invoices/invoices.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderItem.name, schema: OrderItemSchema }
    ]),
    UsersModule,
    ProductsModule,
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService, MongooseModule],
})
export class OrdersModule { }
