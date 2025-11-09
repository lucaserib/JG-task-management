import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationPayload, NotificationType } from '@repo/types';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsClient: ClientProxy,
  ) {}

  async publishTaskCreated(
    taskId: string,
    title: string,
    creatorId: string,
    assigneeIds: string[],
  ) {
    this.logger.log(`Publishing task.created event for task ${taskId}`);

    for (const userId of assigneeIds) {
      if (userId !== creatorId) {
        const notification: NotificationPayload = {
          userId,
          type: NotificationType.TASK_ASSIGNED,
          title: 'New Task Assigned',
          message: `You have been assigned to task: ${title}`,
          taskId,
          metadata: { creatorId },
        };

        this.notificationsClient.emit('task.created', notification);
      }
    }
  }

  async publishTaskUpdated(
    taskId: string,
    title: string,
    userId: string,
    creatorId: string,
    assigneeIds: string[],
    changes: Record<string, any>,
  ) {
    this.logger.log(`Publishing task.updated event for task ${taskId}`);

    const usersToNotify = new Set<string>(assigneeIds);
    usersToNotify.add(creatorId);

    for (const notifyUserId of usersToNotify) {
      if (notifyUserId !== userId) {
        const notification: NotificationPayload = {
          userId: notifyUserId,
          type: NotificationType.TASK_STATUS_CHANGED,
          title: 'Task Updated',
          message: `Task "${title}" has been updated`,
          taskId,
          metadata: { updatedBy: userId, changes },
        };

        this.notificationsClient.emit('task.updated', notification);
      }
    }
  }

  async publishCommentCreated(
    taskId: string,
    commentId: string,
    taskTitle: string,
    authorId: string,
    assigneeIds: string[],
  ) {
    this.logger.log(`Publishing comment.created event for task ${taskId}`);

    for (const userId of assigneeIds) {
      if (userId !== authorId) {
        const notification: NotificationPayload = {
          userId,
          type: NotificationType.NEW_COMMENT,
          title: 'New Comment',
          message: `New comment on task: ${taskTitle}`,
          taskId,
          commentId,
          metadata: { authorId },
        };

        this.notificationsClient.emit('comment.created', notification);
      }
    }
  }
}
