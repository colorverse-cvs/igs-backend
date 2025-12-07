import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.entity';
import { CreateCartItemDto, UpdateCartItemDto } from './dto';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { PaymentFactoryService } from '../payments/factories/payment-factory.service';
import { PaymentMethod } from '../payments/schemas/payment.entity';
import { OrdersService } from '../orders/orders.service'; // optional order persistence
import { CheckoutDto } from './dto/checkout.dto';


@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly paymentFactory: PaymentFactoryService,
    private readonly ordersService: OrdersService, // inject optional OrdersService
  ) { }

  async findOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    let query: any = {};
    if (userId) query.user = new Types.ObjectId(userId);
    else if (sessionId) query.sessionId = sessionId;

    let cart = await this.cartModel.findOne(query).populate('items.product').exec();

    if (userId && sessionId) {
      const sessionCart = await this.cartModel.findOne({ sessionId });
      if (sessionCart) {
        if (!cart) {
          sessionCart.user = new Types.ObjectId(userId);
          sessionCart.sessionId = undefined;
          await sessionCart.save();
          return sessionCart.populate('items.product');
        } else {
          for (const it of sessionCart.items) {
            const found = cart.items.find(i => i.product.toString() === it.product.toString());
            if (found) found.quantity += it.quantity;
            else cart.items.push(it);
          }
          await cart.save();
          await sessionCart.deleteOne();
          return cart.populate('items.product');
        }
      }
    }

    if (!cart) {
      const user = userId ? await this.usersService.findOneById(userId) : undefined;
      const cartData: any = { items: [] };
      if (user) cartData.user = user._id;
      if (sessionId) cartData.sessionId = sessionId;
      cart = new this.cartModel(cartData);
      await cart.save();
    }
    return cart;
  }

  // allow either userId (authenticated) or sessionId (guest)
  async addItem(userId: string | undefined, sessionId: string | undefined, dto: CreateCartItemDto): Promise<Cart> {
    const { productId, quantity } = dto;
    const cart = await this.findOrCreateCart(userId, sessionId);
    const product = await this.productsService.findProductById(productId);
    if (!product) throw new NotFoundException('Product not found');
    const existingItem = cart.items.find(item => (item.product as any).toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: new Types.ObjectId(productId),
        quantity,
      } as any);
    }

    await cart.save();
    return cart.populate('items.product');
  }

  async updateItem(userId: string | undefined, sessionId: string | undefined, cartItemId: string, dto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.findOrCreateCart(userId, sessionId);
    const item = cart.items.id(cartItemId);
    if (!item) throw new NotFoundException('Cart item not found');
    if (typeof dto.quantity === 'number') item.quantity = dto.quantity;
    await cart.save();
    return cart.populate('items.product');
  }

  async removeItem(userId: string | undefined, sessionId: string | undefined, cartItemId: string): Promise<Cart> {
    const cart = await this.findOrCreateCart(userId, sessionId);
    const item = cart.items.id(cartItemId);
    if (item) {
      cart.items.pull(item);
    }
    await cart.save();
    return cart.populate('items.product');
  }

  async clearCart(userId: string | undefined, sessionId: string | undefined): Promise<void> {
    const cart = await this.findOrCreateCart(userId, sessionId);
    cart.items = [] as any;
    await cart.save();
  }

  async getCartSummary(userId: string | undefined, sessionId: string | undefined): Promise<Cart> {
    return this.findOrCreateCart(userId, sessionId);
  }

  // Business logic for checkout
  async checkout(userId: string | undefined, sessionId: string | undefined, payload: CheckoutDto) {
    // require guest details if no user
    if (!userId) {
      if (!payload?.name || !payload?.email || !payload?.phone || !payload?.address) {
        throw new BadRequestException('Guest checkout requires customerName, customerEmail, customerPhone and shippingAddress');
      }
    }
    const cart = await this.getCartSummary(userId, sessionId);
    let totalInPaise = 0;
    for (const item of cart.items.toObject()) {
      const product: any = item.product;
      const unitPaise = product?.priceInPaise ?? (typeof product?.price === 'number' ? Math.round(product.price * 100) : 0);
      totalInPaise += unitPaise * (item.quantity || 1);
    }
    if (totalInPaise <= 0) throw new BadRequestException('Cart total must be > 0');

    // create pending order record (optional, recommended)
    const orderRecord = await this.ordersService.createPending({
      cartId: cart._id.toString(),
      userId: userId ?? null,
      sessionId: sessionId ?? null,
      items: cart.items.map(i => ({
        product: (i.product as any)._id.toString() ?? i.product,
        quantity: i.quantity
      })),
      amount: totalInPaise,
      currency: 'INR',
      customer: userId ? undefined : {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        shippingAddress: payload.address,
      },
      paymentMethod: payload.paymentMethod,
    });

    if (payload.paymentMethod === 'razorpay') {
      const strategy: any = this.paymentFactory.getStrategy(PaymentMethod.RAZORPAY);
      const shortId = orderRecord._id.toString().slice(-6);
      const receipt = `ORD-${shortId}-${Date.now()}`;
      // const order = await strategy.createPayment(totalInPaise, { receipt, notes: { orderId: orderRecord._id.toString() } });
      const order = await strategy.createPayment(orderRecord);
      // store razorpay order id on orderRecord
      await this.ordersService.updatePaymentMeta(orderRecord._id, { razorpayOrderId: order.id });

      // return order + keyId for client to open Razorpay Checkout
      return { order, keyId: process.env.RAZORPAY_KEY_ID, orderRecord };
    }

    if (payload.paymentMethod === 'cod') {
      await this.ordersService.markAsPlaced(orderRecord._id);
      await this.clearCart(userId, sessionId);
      return { message: 'Order placed with Cash on Delivery', orderRecord };
    }

    throw new BadRequestException('Unsupported payment method');
  }
}
