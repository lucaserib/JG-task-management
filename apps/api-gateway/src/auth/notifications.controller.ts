import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import {
  NotificationResponse,
  PaginatedResponse,
  UserPayload,
} from '@repo/types';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsService: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  async getNotifications(
    @Query('page') page = 1,
    @Query('size') size = 10,
    @CurrentUser() user: UserPayload,
  ): Promise<PaginatedResponse<NotificationResponse>> {
    try {
      return await firstValueFrom(
        this.notificationsService.send(
          { cmd: 'get_user_notifications' },
          { userId: user.id, page, size },
        ),
      );
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to get notifications',
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
  })
  async getUnreadCount(
    @CurrentUser() user: UserPayload,
  ): Promise<{ count: number }> {
    try {
      return await firstValueFrom(
        this.notificationsService.send(
          { cmd: 'get_unread_count' },
          { userId: user.id },
        ),
      );
    } catch (error) {
      throw new HttpException(
        error instanceof Error
          ? error.message
          : 'Failed to get unread count',
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(
    @Param('id') notificationId: string,
  ): Promise<NotificationResponse> {
    try {
      return await firstValueFrom(
        this.notificationsService.send(
          { cmd: 'mark_as_read' },
          { notificationId },
        ),
      );
    } catch (error) {
      throw new HttpException(
        error instanceof Error
          ? error.message
          : 'Failed to mark notification as read',
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.NOT_FOUND,
      );
    }
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read successfully',
  })
  async markAllAsRead(
    @CurrentUser() user: UserPayload,
  ): Promise<{ affected: number }> {
    try {
      return await firstValueFrom(
        this.notificationsService.send(
          { cmd: 'mark_all_as_read' },
          { userId: user.id },
        ),
      );
    } catch (error) {
      throw new HttpException(
        error instanceof Error
          ? error.message
          : 'Failed to mark all notifications as read',
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async deleteNotification(
    @Param('id') notificationId: string,
  ): Promise<{ message: string }> {
    try {
      return await firstValueFrom(
        this.notificationsService.send(
          { cmd: 'delete_notification' },
          { notificationId },
        ),
      );
    } catch (error) {
      throw new HttpException(
        error instanceof Error
          ? error.message
          : 'Failed to delete notification',
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.NOT_FOUND,
      );
    }
  }
}
