import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.entity';
import { AuthModule } from '../auth/auth.module';
import { Address, AddressSchema } from './schemas/address.entity';

@Module({
  imports: [MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
    { name: Address.name, schema: AddressSchema }
  ]), 
  AuthModule
],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
