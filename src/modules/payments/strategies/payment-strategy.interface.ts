import { Order } from '../../orders/schemas/order.entity';
import { Payment } from '../schemas/payment.entity';

export interface IPaymentStrategy {
    createPayment(order: Order): Promise<Payment>;
    processPayment(paymentId: string): Promise<Payment>;
    handleWebhook?(payload: any): Promise<void>;
}