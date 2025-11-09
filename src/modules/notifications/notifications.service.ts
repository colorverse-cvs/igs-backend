import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from './schemas/notifications.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    private readonly usersService: UsersService,
  ) {}

  async createInAppNotification(userId: string, message: string) {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const notification = new this.notificationModel({
      user: new Types.ObjectId(userId),
      message,
    });

    return notification.save();
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notificationModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  // Mark a notification as read
  async markAsRead(notificationId: string) {
    const notification = await this.notificationModel.findById(notificationId);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.read = true;
    return notification.save();
  }
}
