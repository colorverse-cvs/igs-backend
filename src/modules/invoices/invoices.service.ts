import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import easyinvoice from 'easyinvoice';
import { Order, OrderDocument } from '../orders/schemas/order.entity';

@Injectable()
export class InvoicesService {
    constructor(
        @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    ) { }

    async generateInvoice(orderId: string): Promise<string> {
        // Populate user, items, and product references
        const order = await this.orderModel
            .findById(orderId)
            .populate('user')
            .populate({
                path: 'items',
                populate: { path: 'product' },
            })
            .exec();

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Prepare invoice data
        const invoiceData = {
            orderId: order._id.toString(),
            customer: {
                name: order.user?.firstName + ' ' + order.user?.lastName || 'Unknown Customer',
                email: order.user?.email || 'N/A',
            },
            items: order.items.map((item: any) => ({
                name: item.product?.name || 'Unnamed Product',
                quantity: item.quantity,
                price: item.price,
            })),
            total: order.total,
            date: order.createdAt,
        };

        // Generate and save invoice PDF
        const invoicePath = `invoices/invoice_${order._id}.pdf`;
        //     easyinvoice.createInvoice(invoiceData, function (result) {
        //     // The response will contain a base64 encoded PDF file
        //     console.log('PDF base64 string: ', result.pdf);

        //     // Now this result can be used to save, download or render your invoice
        //     // Please review the documentation below on how to do this
        // });
        //createInvoice(invoiceData, invoicePath);

        return invoicePath;
    }
}
