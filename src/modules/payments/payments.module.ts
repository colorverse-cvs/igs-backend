import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from '../orders/orders.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.entity';
import { PaymentFactoryService } from './factories/payment-factory.service';
import { CodPaymentStrategy } from './strategies/cod-payment.strategy';
import { RazorpayPaymentStrategy } from './strategies/razorpay-payment.strategy';
import { Order, OrderSchema } from '../orders/schemas/order.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    OrdersModule,
    AuthModule, 
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentFactoryService,
    RazorpayPaymentStrategy,
    CodPaymentStrategy,
  ],
  exports: [PaymentsService, PaymentFactoryService],
})
export class PaymentsModule { }