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

    async getCustomersWithStats(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const result = await this.orderModel.aggregate([
            // only real users (ignore guest orders)
            { $match: { user: { $ne: null } } },

            // group by user
            {
                $group: {
                    _id: '$user',
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$total' }, // paise
                    lastOrderAt: { $max: '$createdAt' },
                },
            },

            // join users
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },

            // ✅ only customers
            // { $match: { 'user.role': 'customer' } },

            // join phones
            {
                $lookup: {
                    from: 'phones',
                    localField: 'user.phones',
                    foreignField: '_id',
                    as: 'phones',
                },
            },

            // pick primary phone
            {
                $addFields: {
                    primaryPhone: {
                        $first: {
                            $filter: {
                                input: '$phones',
                                as: 'p',
                                cond: { $eq: ['$$p.isPrimary', true] },
                            },
                        },
                    },
                },
            },

            // shape output
            {
                $project: {
                    _id: 1,
                    name: {
                        $trim: {
                            input: {
                                $concat: [
                                    { $ifNull: ['$user.firstName', ''] },
                                    ' ',
                                    { $ifNull: ['$user.lastName', ''] },
                                ],
                            },
                        },
                    },
                    email: '$user.email',
                    phone: '$primaryPhone.number',
                    profile: '$user.profile',
                    totalOrders: 1,
                    totalSpent: '$totalSpent', // rupees
                    joinDate: '$user.createdAt',
                    lastOrderAt: 1,
                },
            },

            // sort
            { $sort: { lastOrderAt: -1 } },

            // ✅ pagination + total count
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                    ],
                    meta: [
                        { $count: 'total' },
                    ],
                },
            },
        ]);

        const data = result[0]?.data ?? [];
        const total = result[0]?.meta[0]?.total ?? 0;

        return {
            data,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }

}
