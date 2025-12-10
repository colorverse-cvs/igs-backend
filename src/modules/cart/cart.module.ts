import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas/cart.entity';
import { CartItem, CartItemSchema } from './schemas/cart-item.entity';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { PaymentsModule } from '../payments/payments.module';
import { OrdersModule } from '../orders/orders.module';
import { SessionsModule } from '../sessions/sessions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: CartItem.name, schema: CartItemSchema },
    ]),
    ProductsModule,
    UsersModule,
    PaymentsModule,
    OrdersModule,
    SessionsModule,
    AuthModule,
  ],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService, MongooseModule],
})
export class CartModule { }
