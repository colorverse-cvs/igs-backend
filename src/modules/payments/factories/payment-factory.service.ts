import { Injectable } from '@nestjs/common';
// import { StripePaymentStrategy } from '../strategies/stripe-payment.strategy';
import { IPaymentStrategy } from '../strategies/payment-strategy.interface';
import { CodPaymentStrategy } from '../strategies/cod-payment.strategy';
import { PaymentMethod } from '../schemas/payment.entity';
import { RazorpayPaymentStrategy } from '../strategies/razorpay-payment.strategy';



@Injectable()
export class PaymentFactoryService {
    constructor(
        // private readonly stripeStrategy: StripePaymentStrategy,
        private readonly codStrategy: CodPaymentStrategy,
        private readonly razorpayStrategy: RazorpayPaymentStrategy,
    ) { }

    getStrategy(paymentMethod: PaymentMethod): IPaymentStrategy {
        switch (paymentMethod) {
            // case PaymentMethod.STRIPE:
            //     return this.stripeStrategy;
            case PaymentMethod.CASH_ON_DELIVERY:
                return this.codStrategy;
            case PaymentMethod.RAZORPAY:
                return this.razorpayStrategy;
            default:
                throw new Error(`Payment method ${paymentMethod} not supported`);
        }
    }
}