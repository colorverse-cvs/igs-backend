import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.entity';
import { User, UserDocument } from '../users/schemas/user.entity';
import { Product, ProductDocument } from '../products/schemas/product.entity';

@Injectable()
export class ReportsService {
    constructor(
        @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    ) { }

    async getSalesReport(startDate: Date, endDate: Date) {
        // Find all orders in the date range
        const orders = await this.orderModel
            .find({
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            })
            .exec();

        const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalOrders = orders.length;

        return {
            totalSales,
            totalOrders,
            orders,
        };
    }

    async getAnalytics() {
        const [totalUsers, totalProducts, totalOrders] = await Promise.all([
            this.userModel.countDocuments().exec(),
            this.productModel.countDocuments().exec(),
            this.orderModel.countDocuments().exec(),
        ]);

        return {
            totalUsers,
            totalProducts,
            totalOrders,
        };
    }
}
