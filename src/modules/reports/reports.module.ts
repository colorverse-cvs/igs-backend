import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Order, OrderSchema } from '../orders/schemas/order.entity';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    OrdersModule,
    ProductsModule,
    UsersModule,
    AuthModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [],
})
export class ReportsModule { }
