import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas/cart.entity';
import { CartItem, CartItemSchema } from './schemas/cart-item.entity';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: CartItem.name, schema: CartItemSchema },
    ]),
    ProductsModule,
    UsersModule,
  ],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService, MongooseModule],
})
export class CartModule { }
