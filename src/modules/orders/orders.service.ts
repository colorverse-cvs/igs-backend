import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.entity';
import { OrderItem, OrderItemDocument } from './schemas/order-item.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(OrderItem.name) private readonly orderItemModel: Model<OrderItemDocument>,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
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
      user: user._id,
      status: 'placed',
      total,
      items: orderItems.map((item) => item._id),
    });

    return order.save();
  }

  async findAllOrders(): Promise<Order[]> {
    return this.orderModel
      .find()
      .populate('user')
      .populate({ path: 'items', populate: { path: 'product' } })
      .exec();
  }

  async findOrderById(id: string): Promise<Order> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid order ID');

    const order = await this.orderModel
      .findById(id)
      .populate('user')
      .populate({ path: 'items', populate: { path: 'product' } })
      .exec();

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateOrderStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOrderById(id);
    order.status = updateOrderStatusDto.status;
    return order.save();
  }

  async removeOrder(id: string): Promise<void> {
    const order = await this.findOrderById(id);
    if (!order) throw new NotFoundException('Order not found');
    await this.orderModel.deleteOne({ _id: order._id }).exec();
  }
}
