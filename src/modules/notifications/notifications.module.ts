import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsMailService } from './notifications-mail.service';
import { NotificationsSMSService } from './notifications-sms.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema} from './schemas/notifications.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    UsersModule,
  ],
  providers: [NotificationsService, NotificationsMailService, NotificationsSMSService],
  controllers: [NotificationsController],
  exports: [NotificationsService, NotificationsMailService, NotificationsSMSService, MongooseModule],
})
export class NotificationsModule { }
