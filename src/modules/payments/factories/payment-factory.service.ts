import { Injectable } from '@nestjs/common';
import { StripePaymentStrategy } from '../strategies/stripe-payment.strategy';
import { IPaymentStrategy } from '../strategies/payment-strategy.interface';
import { CodPaymentStrategy } from '../strategies/cod-payment.strategy';
import { PaymentMethod } from '../schemas/payment.entity';



@Injectable()
export class PaymentFactoryService {
    constructor(
        private readonly stripeStrategy: StripePaymentStrategy,
        private readonly codStrategy: CodPaymentStrategy,
    ) { }

    getStrategy(paymentMethod: PaymentMethod): IPaymentStrategy {
        switch (paymentMethod) {
            case PaymentMethod.STRIPE:
                return this.stripeStrategy;
            case PaymentMethod.CASH_ON_DELIVERY:
                return this.codStrategy;
            default:
                throw new Error(`Payment method ${paymentMethod} not supported`);
        }
    }
}