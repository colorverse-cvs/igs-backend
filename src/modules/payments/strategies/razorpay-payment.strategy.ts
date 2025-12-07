import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { IPaymentStrategy } from './payment-strategy.interface';
import { Order } from '../../orders/schemas/order.entity';
import { Payment, PaymentMethod, PaymentStatus } from '../schemas/payment.entity';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

const Razorpay = require('razorpay');

@Injectable()
export class RazorpayPaymentStrategy implements IPaymentStrategy {
  private readonly client: any;
  private readonly logger = new Logger(RazorpayPaymentStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<Payment>,
  ) {
    this.client = new Razorpay({
      key_id: this.configService.get<string>('app.razorpay.keyId'),
      key_secret: this.configService.get<string>('app.razorpay.keySecret'),
    });
  }

  /**
   * STEP 1: Create Razorpay Order + Local Payment Record
   */
  async createPayment(order: Order): Promise<Payment> {
    const shortId = order._id.toString().slice(-6);
    const receipt = `ORD-${shortId}-${Date.now()}`;

    try {
      if (!order.total || order.total <= 0) {
        throw new BadRequestException(
          `Invalid order amount: ${order.total}`,
        );
      }

      // Create Razorpay Order
      const rzOrder = await this.client.orders.create({
        amount: order.total,
        currency: order.currency ?? 'INR',
        receipt,
        notes: { orderId: order._id.toString() },
        payment_capture: 1,
      });

      // Create Local Payment Record
      const payment = await this.paymentModel.create({
        order: order._id, 
        paymentIntentId: rzOrder.id, 
        amount: order.total,
        currency: order.currency ?? 'INR',
        status: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.RAZORPAY, // Enum value
        paymentDetails: {
          type: 'razorpay_order',
          razorpayOrderId: rzOrder.id,
          receipt: rzOrder.receipt,
        },
      });


      this.logger.log(`✔ Razorpay order created: ${rzOrder.id}`);
      return payment;
    } catch (err) {
      this.logger.error('❌ Failed to create Razorpay order', err);

      throw new InternalServerErrorException({
        message: 'Failed to create Razorpay payment order',
        reason: err?.error?.description ?? err.message,
      });
    }
  }

  /**
   * STEP 2: Client finished payment → Verify with Razorpay
   */
  async processPayment(paymentId: string): Promise<Payment> {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) throw new BadRequestException('Payment record not found');

    try {
      const rzPayment = await this.client.payments.fetch(
        payment.paymentIntentId,
      );

      // Convert Razorpay status → internal status
      const statusMap: Record<string, PaymentStatus> = {
        captured: PaymentStatus.SUCCEEDED,
        failed: PaymentStatus.FAILED,
        refunded: PaymentStatus.REFUNDED,
        authorized: PaymentStatus.PENDING,
        created: PaymentStatus.PENDING,
      };

      const mappedStatus =
        statusMap[rzPayment.status.toLowerCase()] ?? PaymentStatus.PENDING;

      payment.status = mappedStatus;
      payment.paymentDetails = rzPayment;

      await payment.save();

      this.logger.log(`✔ Payment updated via verify: ${payment._id}`);
      return payment;
    } catch (err) {
      this.logger.error('❌ Failed to process Razorpay payment', err);

      throw new InternalServerErrorException({
        message: 'Failed to verify Razorpay payment',
        reason: err?.error?.description ?? err.message,
      });
    }
  }

  /**
   * STEP 3: Handle Razorpay Webhook
   */
  async handleWebhook(payload: any): Promise<void> {
    try {
      const event = payload.event;
      const rzPayment = payload.payload?.payment?.entity;

      if (!rzPayment) {
        this.logger.warn('Webhook received without payment entity');
        return;
      }

      const payment = await this.paymentModel.findOne({
        providerPaymentId: rzPayment.id,
      });

      if (!payment) {
        this.logger.warn(`Payment record not found for webhook: ${rzPayment.id}`);
        return;
      }

      if (event === 'payment.captured') {
        payment.status = PaymentStatus.SUCCEEDED;
      }

      if (event === 'payment.failed') {
        payment.status = PaymentStatus.FAILED;
      }

      payment.paymentDetails = rzPayment;
      await payment.save();

      this.logger.log(`Webhook processed for payment: ${rzPayment.id}`);
    } catch (err) {
      this.logger.error('❌ Error processing Razorpay webhook', err);
    }
  }

  /**
   * Verify Razorpay Webhook Signature
   */
  async verifySignature(payload: string, signature: string, secret: string,): Promise<boolean> {
    const crypto = await import('crypto');

    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return expected === signature;
  }
}
