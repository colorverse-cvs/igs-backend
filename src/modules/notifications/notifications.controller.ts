import { Controller, Post, Get, Patch, Param, Req, Body, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { Request } from 'express';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new in-app notification for the current user' })
    @ApiResponse({ status: 201, description: 'Notification created successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    createNotification(@Req() req: Request, @Body() dto: CreateNotificationDto) {
        const userId = (req.user as any)._id;
        return this.notificationsService.createInAppNotification(userId, dto.message);
    }

    @Get()
    @ApiOperation({ summary: 'Get all notifications for the current user' })
    @ApiResponse({ status: 200, description: 'List of user notifications' })
    getNotifications(@Req() req: Request) {
        const userId = (req.user as any)._id;
        return this.notificationsService.getNotifications(userId);
    }

    @Patch(':notificationId')
    @ApiOperation({ summary: 'Mark a specific notification as read' })
    @ApiParam({
        name: 'notificationId',
        type: 'string',
        description: 'The ID of the notification to mark as read',
        example: '6720a2f4d4ab1c2e88f9d123',
    })
    @ApiResponse({ status: 200, description: 'Notification marked as read successfully' })
    @ApiResponse({ status: 404, description: 'Notification not found' })
    markAsRead(@Param('notificationId') notificationId: string) {
        return this.notificationsService.markAsRead(notificationId);
    }
}
