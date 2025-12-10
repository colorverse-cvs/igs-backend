import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './schemas/order.entity';
import { OrderItem, OrderItemSchema } from './schemas/order-item.entity';
// ensure these modules export the services your OrdersService depends on
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule, 
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderItem.name, schema: OrderItemSchema },
    ]),
    UsersModule,    // provides UsersService
    ProductsModule, // provides ProductsService
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
