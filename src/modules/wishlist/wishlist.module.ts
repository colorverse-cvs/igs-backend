import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Wishlist, WishlistSchema } from './schemas/wishlist.entity';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Wishlist.name, schema: WishlistSchema }]),
    UsersModule,
    ProductsModule,
  ],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule { }
