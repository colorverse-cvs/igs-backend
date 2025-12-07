import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoicesService } from './invoices.service';
import { Order, OrderSchema } from '../orders/schemas/order.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    // optionally import OrdersModule if you need OrdersService:
    // OrdersModule,
  ],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule { }
