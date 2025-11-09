import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from './schemas/cart.entity';
import { CartItem } from './schemas/cart-item.entity';
import { CreateCartItemDto, UpdateCartItemDto } from './dto';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) { }

  async findOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartModel
      .findOne({ user: new Types.ObjectId(userId) })
      .populate('items.product')
      .exec();

    if (!cart) {
      const user = await this.usersService.findOneById(userId);
      if (!user) throw new NotFoundException('User not found');

      cart = new this.cartModel({ user: user._id, items: [] });
      await cart.save();
    }

    return cart;
  }

  async addItem(userId: string, dto: CreateCartItemDto): Promise<Cart> {
    const { productId, quantity } = dto;
    const cart = await this.findOrCreateCart(userId);
    const product = await this.productsService.findProductById(productId);
    if (!product) throw new NotFoundException('Product not found');
    const existingItem = cart.items.find(
      (item) => item?.id.toString() === productId,
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: new Types.ObjectId(productId),
        quantity,
      } as CartItem);
    }

    await cart.save();
    return cart.populate('items.product');
  }

  async updateItem(userId: string, cartItemId: string, dto: UpdateCartItemDto,): Promise<Cart> {
    const cart = await this.findOrCreateCart(userId);
    const item = cart.items.id(cartItemId);
    if (!item) throw new NotFoundException('Cart item not found');
    item.quantity = dto.quantity;
    await cart.save();
    return cart.populate('items.product');
  }

  async removeItem(userId: string, cartItemId: string): Promise<Cart> {
    const cart = await this.findOrCreateCart(userId);
    const item = cart.items.id(cartItemId);
    if (!item) throw new NotFoundException('Cart item not found');
    item.deleteOne();
    await cart.save();
    return cart.populate('items.product');
  }

  async getCartSummary(userId: string): Promise<Cart> {
    return this.findOrCreateCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    const cart: any = await this.findOrCreateCart(userId);
    debugger
    cart.items = [];
    await cart.save();
  }
}
