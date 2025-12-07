import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { json } from 'body-parser';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CartModule } from './modules/cart/cart.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
// import { APP_GUARD } from '@nestjs/core';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
// import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import { UploadsModule } from './modules/uploads/uploads.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MongooseModule.forRootAsync({
      useFactory: (cfg: any) => ({ uri: cfg.MONGO_URI }),
      inject: [configuration.KEY],
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    InvoicesModule,
    CartModule,
    ReviewsModule,
    WishlistModule,
    NotificationsModule,
    ReportsModule,
    UploadsModule,
    ShipmentsModule,
    EventEmitterModule.forRoot(),
  ],
  providers: [
    // { provide: APP_GUARD, useClass: JwtAuthGuard },
    // { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        json({
          verify: (req: any, res, buf) => {
            req.rawBody = buf;
          },
        }),
      )
      .forRoutes('payments/webhook')

      // 👇 Now apply your global middlewares
      .apply(LoggerMiddleware, /*RateLimitMiddleware*/)
      .forRoutes('*'); // applies to all routes
  }
}
