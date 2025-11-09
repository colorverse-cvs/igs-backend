import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [OrdersModule, ProductsModule, UsersModule, AuthModule],
  providers: [ReportsService],
  controllers: [ReportsController]
})
export class ReportsModule { }
