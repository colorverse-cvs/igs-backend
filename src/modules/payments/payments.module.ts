import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
// import { MongooseModule } from '@nestjs/mongoose';
// import { Order, OrderSchema } from '../orders/schemas/order.entity';
import { OrdersModule } from '../orders/orders.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.entity';
import { PaymentFactoryService } from './factories/payment-factory.service';
import { CodPaymentStrategy } from './strategies/cod-payment.strategy';
import { StripePaymentStrategy } from './strategies/stripe-payment.strategy';
// import { StripePaymentStrategy } from './strategies/paypal-payment.strategy';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    OrdersModule,
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema }
    ]),
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentFactoryService,
    StripePaymentStrategy,
    CodPaymentStrategy,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule { }