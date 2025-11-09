import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.entity';
import { Category, CategorySchema } from './schemas/category.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService, MongooseModule],
})
export class ProductsModule {}
