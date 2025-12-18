import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ORDER_STATUSES, ALLOWED_STATUS_TRANSITIONS, OrderStatus } from './constants/order-status';
import { Order } from './schemas/order.entity';
import { InjectConnection } from '@nestjs/mongoose';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { OrderItem } from './schemas/order-item.entity';
import { ORDER_STATUS_CHANGED } from 'src/common/events';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(OrderItem.name) private readonly orderItemModel: Model<OrderItem>,
    private readonly eventEmitter: EventEmitter2,
    @InjectConnection() private readonly connection: Connection,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) { }

  async createOrder(createOrderDto: any): Promise<Order> {
    const { userId, items } = createOrderDto;

    const user = await this.usersService.findOneById(userId);
    if (!user) throw new NotFoundException('User not found');

    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const product = await this.productsService.findProductById(item.productId);
      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }

      const itemTotal = product.price * item.quantity;
      const orderItem = new this.orderItemModel({
        product: product._id,
        quantity: item.quantity,
        price: itemTotal,
      });

      await orderItem.save();
      orderItems.push(orderItem);
      total += itemTotal;
    }

    const order = new this.orderModel({
      user: user?._id,
      status: 'placed',
      total,
      items: orderItems.map((item) => item._id),
    });

    await order.save();

    // Reduce stock for each order item
    // for (const item of createOrderDto.items) {
    //   await this.productsService.findByIdAndUpdate(
    //     item.productId,
    //     { $inc: { stock: -item.quantity } },
    //     { new: true }
    //   );
    // }

    return order;
  }

  async findAllOrders(): Promise<Order[]> {
    return this.orderModel
      .find()
      .populate({ path: 'user', model: 'User' })
      .populate({
        path: 'items',
        model: 'OrderItem',
        populate: { path: 'product', model: 'Product' },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOrderById(id: string): Promise<Order> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid order ID');

    const order = await this.orderModel
      .findById(id)
      .populate({ path: 'user', model: 'User' })
      .populate({
        path: 'items',
        model: 'OrderItem',
        populate: { path: 'product', model: 'Product' },
      })
      .sort({ createdAt: -1 })
      .exec();

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus, reason: string | undefined, actor: any) {
    if (!ORDER_STATUSES.includes(newStatus)) throw new BadRequestException('Invalid status');

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const order = await this.orderModel.findById(orderId).session(session);
      if (!order) throw new NotFoundException('Order not found');

      const current = order.status as OrderStatus;
      const allowed = ALLOWED_STATUS_TRANSITIONS[current] || [];
      if (!allowed.includes(newStatus)) {
        throw new BadRequestException(`Cannot change status from ${current} to ${newStatus}`);
      }

      // optional: role-based check
      const actorRole = actor?.role;
      if (newStatus === 'shipped' && actorRole !== 'admin' && actorRole !== 'logistics') {
        throw new ForbiddenException('Not permitted to mark shipped');
      }

      // apply status change
      order.status = newStatus;
      order.updatedAt = new Date();
      order.history = order.history || [];
      order.history.push({ status: newStatus, changedBy: actor?.id ? new Types.ObjectId(actor.id) : undefined, reason, at: new Date() });

      await order.save({ session });

      // domain side-effects: e.g. create shipment when placed, decrement stock when placed/paid etc.
      // emit event for other modules to handle asynchronously
      this.eventEmitter.emit(ORDER_STATUS_CHANGED, { orderId: order._id.toString(), from: current, to: newStatus, actor, reason });

      await session.commitTransaction();
      session.endSession();

      return order;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  async removeOrder(id: string): Promise<void> {
    const order = await this.findOrderById(id);
    if (!order) throw new NotFoundException('Order not found');
    await this.orderModel.deleteOne({ _id: order._id }).exec();
  }

  // -----------------------
  // New helpers for checkout flow
  // -----------------------
  async createPending(payload: any): Promise<Order> {
    const { userId, items, amount, currency = 'INR', customer, cartId, sessionId, paymentMethod, } = payload;

    const orderItems: any[] = [];
    // If items contain productId, validate and create order item docs
    for (const it of items) {
      const product = await this.productsService.findProductById(it.product);
      if (!product) throw new NotFoundException(`Product ${it.productId} not found`);

      const price = typeof product.price === 'number' ? product.price : 0;
      const itemTotal = (price * (it.quantity || 1));
      const orderItem = new this.orderItemModel({
        product: product._id,
        quantity: it.quantity || 1,
        price: itemTotal,
      });
      await orderItem.save();
      orderItems.push(orderItem);
    }
    const orderData: any = {
      items: orderItems.map(i => i._id),
      total: amount ?? orderItems.reduce((s, oi) => s + (oi.price || 0), 0),
      currency,
      status: 'pending',
      paymentMethod: paymentMethod ?? 'unknown',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (userId) orderData.user = new Types.ObjectId(userId);
    if (cartId) orderData.cartId = cartId;
    if (sessionId) orderData.sessionId = sessionId;
    if (customer) orderData.customer = customer;

    const order = new this.orderModel(orderData);
    await order.save();
    return order;
  }

  async updatePaymentMeta(orderId: string, meta: Record<string, any>): Promise<Order> {
    if (!Types.ObjectId.isValid(orderId)) throw new BadRequestException('Invalid order ID');
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');
    order.paymentMeta = {
      ...((order as any).paymentMeta || {}),
      ...meta,
    };
    order.updatedAt = new Date();
    return order.save();
  }

  async markAsPlaced(orderId: string): Promise<Order> {
    if (!Types.ObjectId.isValid(orderId)) throw new BadRequestException('Invalid order ID');
    const order = await this.orderModel.findById(orderId).populate({ path: 'items', populate: { path: 'product' } });
    if (!order) throw new NotFoundException('Order not found');

    order.status = 'placed';
    order.updatedAt = new Date();

    if (Array.isArray(order.items)) {
      for (const oi of (order.items as any[])) {
        try {
          const pid = (oi.product as any)?._id ?? oi.product;
          if (pid) {
            await this.productsService.decrementStock(pid.toString(), (oi.quantity || 0));
          }
        } catch (err) {
          // ignore stock errors here; log if you have a logger
          console.error('Stock decrement failed', err);
        }
      }
    }

    return order.save();
  }

  async findUserOrders(userId: string): Promise<Order[]> {
    const order = await this.orderModel
      .find({ user: userId })
      .populate({ path: 'user', model: 'User' })
      .populate({
        path: 'items',
        model: 'OrderItem',
        populate: { path: 'product', model: 'Product' },
      })
      .sort({ createdAt: -1 })
      .exec();

    if (!order) throw new NotFoundException('Order not found');

    return order
  }

  async findOrderByRazorpayOrderId(razorpayOrderId: string): Promise<Order | null> {
    return this.orderModel.findOne({ 'paymentMeta.razorpayOrderId': razorpayOrderId }).exec();
  }

}
