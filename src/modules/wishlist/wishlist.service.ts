import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wishlist, WishlistDocument } from './schemas/wishlist.entity';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name)
    private readonly wishlistModel: Model<WishlistDocument>,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  async addToWishlist(userId: string, productId: string): Promise<Wishlist> {
    const user = await this.usersService.findOneById(userId);
    if (!user) throw new NotFoundException('User not found');

    const product = await this.productsService.findProductById(productId);
    if (!product) throw new NotFoundException('Product not found');

    // Prevent duplicates
    const existing = await this.wishlistModel.findOne({
      user: new Types.ObjectId(userId),
      product: new Types.ObjectId(productId),
    });

    if (existing) {
      return existing;
    }

    const wishlistItem = new this.wishlistModel({
      user: user._id,
      product: product._id,
    });

    return wishlistItem.save();
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const deleted = await this.wishlistModel.findOneAndDelete({
      user: new Types.ObjectId(userId),
      product: new Types.ObjectId(productId),
    });

    if (!deleted) {
      throw new NotFoundException('Wishlist item not found');
    }
  }

  async viewWishlist(userId: string): Promise<Wishlist[]> {
    return this.wishlistModel
      .find({ user: new Types.ObjectId(userId) })
      .populate('product')
      .exec();
  }
}
