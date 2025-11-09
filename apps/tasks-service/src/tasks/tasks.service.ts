import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateTaskDto,
  UpdateTaskDto,
  CreateCommentDto,
  TaskResponse,
  CommentResponse,
  PaginatedResponse,
  TaskFilters,
  AssigneeResponse,
  TaskHistoryResponse,
} from '@repo/types';
import { Task } from '../entities/task.entity';
import { Comment } from '../entities/comment.entity';
import { TaskHistory } from '../entities/task-history.entity';
import { TaskAssignee } from '../entities/task-assignee.entity';
import { EventsService } from '../events/events.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(TaskHistory)
    private readonly historyRepository: Repository<TaskHistory>,
    @InjectRepository(TaskAssignee)
    private readonly assigneeRepository: Repository<TaskAssignee>,
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,
    private readonly eventsService: EventsService,
  ) {}

  async getTasks(
    filters: TaskFilters & { userId?: string },
  ): Promise<PaginatedResponse<TaskResponse>> {
    const { page = 1, size = 10, status, priority, assigneeId, search, userId } = filters;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .orderBy('task.createdAt', 'DESC');

    if (userId) {
      queryBuilder.andWhere('(task.creatorId = :userId OR assignee.userId = :userId)', { userId });
    }

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority });
    }

    if (assigneeId) {
      queryBuilder.andWhere('assignee.userId = :assigneeId', { assigneeId });
    }

    if (search) {
      queryBuilder.andWhere('(task.title ILIKE :search OR task.description ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    const [tasks, total] = await queryBuilder
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    const tasksWithAssignees = await Promise.all(tasks.map((task) => this.mapTaskToResponse(task)));

    return {
      data: tasksWithAssignees,
      meta: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  async getTaskById(id: string, userId?: string): Promise<TaskResponse> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignees'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (userId) {
      const isCreator = task.creatorId === userId;
      const isAssignee = task.assignees.some((assignee) => assignee.userId === userId);

      if (!isCreator && !isAssignee) {
        throw new ForbiddenException('You do not have access to this task');
      }
    }

    return this.mapTaskToResponse(task);
  }

  async createTask(createTaskDto: CreateTaskDto & { creatorId: string }): Promise<TaskResponse> {
    const { assigneeIds = [], creatorId, ...taskData } = createTaskDto;

    const task = this.taskRepository.create({
      ...taskData,
      creatorId,
    });

    const savedTask = await this.taskRepository.save(task);

    if (assigneeIds.length > 0) {
      await this.assignUsersToTask(savedTask.id, assigneeIds);
    }

    await this.createHistoryEntry(savedTask.id, creatorId, 'CREATED', {
      task: taskData,
    });

    await this.eventsService.publishTaskCreated(
      savedTask.id,
      savedTask.title,
      creatorId,
      assigneeIds,
    );

    const taskWithAssignees = await this.taskRepository.findOne({
      where: { id: savedTask.id },
      relations: ['assignees'],
    });

    return this.mapTaskToResponse(taskWithAssignees!);
  }

  async updateTask(
    id: string,
    updateTaskDto: UpdateTaskDto & { userId: string },
  ): Promise<TaskResponse> {
    const { userId, assigneeIds, ...updates } = updateTaskDto;

    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignees'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.creatorId !== userId) {
      throw new ForbiddenException('Only the task creator can update this task');
    }

    const oldValues: Record<string, any> = {};
    const changes: Record<string, any> = {};

    Object.keys(updates).forEach((key) => {
      const taskKey = key as keyof Task;
      const updatesKey = key as keyof typeof updates;
      if (task[taskKey] !== updates[updatesKey]) {
        oldValues[key] = task[taskKey];
        changes[key] = { old: task[taskKey], new: updates[updatesKey] };
      }
    });

    Object.assign(task, updates);
    const updatedTask = await this.taskRepository.save(task);

    if (assigneeIds !== undefined) {
      await this.assigneeRepository.delete({ taskId: id });
      if (assigneeIds.length > 0) {
        await this.assignUsersToTask(id, assigneeIds);
      }
      changes.assignees = { old: task.assignees.map((a) => a.userId), new: assigneeIds };
    }

    if (Object.keys(changes).length > 0) {
      await this.createHistoryEntry(id, userId, 'UPDATED', changes);
    }

    const currentAssignees =
      assigneeIds !== undefined ? assigneeIds : task.assignees.map((a) => a.userId);

    if (Object.keys(changes).length > 0) {
      await this.eventsService.publishTaskUpdated(
        id,
        updatedTask.title,
        userId,
        task.creatorId,
        currentAssignees,
        changes,
      );
    }

    const taskWithAssignees = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignees'],
    });

    return this.mapTaskToResponse(taskWithAssignees!);
  }

  async deleteTask(id: string, userId?: string): Promise<{ message: string }> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (userId && task.creatorId !== userId) {
      throw new ForbiddenException('Only the task creator can delete this task');
    }

    await this.taskRepository.remove(task);

    return { message: 'Task deleted successfully' };
  }

  async createComment(
    createCommentDto: CreateCommentDto & { taskId: string; authorId: string },
  ): Promise<CommentResponse> {
    const { taskId, authorId, content } = createCommentDto;

    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['assignees'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const isCreator = task.creatorId === authorId;
    const isAssignee = task.assignees.some((assignee) => assignee.userId === authorId);

    if (!isCreator && !isAssignee) {
      throw new ForbiddenException('You do not have access to comment on this task');
    }

    const comment = this.commentRepository.create({
      content,
      taskId,
      authorId,
    });

    const savedComment = await this.commentRepository.save(comment);

    await this.createHistoryEntry(taskId, authorId, 'COMMENT_ADDED', {
      commentId: savedComment.id,
      content,
    });

    const assigneeIds = task.assignees.map((a) => a.userId);
    if (!assigneeIds.includes(task.creatorId)) {
      assigneeIds.push(task.creatorId);
    }

    await this.eventsService.publishCommentCreated(
      taskId,
      savedComment.id,
      task.title,
      authorId,
      assigneeIds,
    );

    return this.mapCommentToResponse(savedComment);
  }

  async getComments(
    taskId: string,
    page = 1,
    size = 10,
    userId?: string,
  ): Promise<PaginatedResponse<CommentResponse>> {
    if (userId) {
      const task = await this.taskRepository.findOne({
        where: { id: taskId },
        relations: ['assignees'],
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      const isCreator = task.creatorId === userId;
      const isAssignee = task.assignees.some((assignee) => assignee.userId === userId);

      if (!isCreator && !isAssignee) {
        throw new ForbiddenException('You do not have access to this task');
      }
    }

    const [comments, total] = await this.commentRepository.findAndCount({
      where: { taskId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    const commentsWithAuthors = await Promise.all(
      comments.map((comment) => this.mapCommentToResponse(comment)),
    );

    return {
      data: commentsWithAuthors,
      meta: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  async getTaskHistory(taskId: string, userId?: string): Promise<TaskHistoryResponse[]> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['assignees'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (userId) {
      const isCreator = task.creatorId === userId;
      const isAssignee = task.assignees.some((assignee) => assignee.userId === userId);

      if (!isCreator && !isAssignee) {
        throw new ForbiddenException('You do not have access to this task');
      }
    }

    const history = await this.historyRepository.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
    });

    const historyWithUsers = await Promise.all(
      history.map(async (entry) => {
        const user = await this.getUserById(entry.userId);
        return {
          id: entry.id,
          taskId: entry.taskId,
          userId: entry.userId,
          user: user || { id: entry.userId, email: 'Unknown', username: 'Unknown' },
          action: entry.action,
          changes: entry.changes,
          createdAt: entry.createdAt,
        };
      }),
    );

    return historyWithUsers;
  }

  private async assignUsersToTask(taskId: string, userIds: string[]): Promise<void> {
    const assignees = userIds.map((userId) => this.assigneeRepository.create({ taskId, userId }));

    await this.assigneeRepository.save(assignees);
  }

  private async createHistoryEntry(
    taskId: string,
    userId: string,
    action: string,
    changes: Record<string, any>,
  ): Promise<void> {
    const history = this.historyRepository.create({
      taskId,
      userId,
      action,
      changes,
    });

    await this.historyRepository.save(history);
  }

  private async mapTaskToResponse(task: Task): Promise<TaskResponse> {
    const assigneeIds = task.assignees?.map((a) => a.userId) || [];
    const assignees = await this.getUsersByIds(assigneeIds);

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      creatorId: task.creatorId,
      assignees,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  private async mapCommentToResponse(comment: Comment): Promise<CommentResponse> {
    const author = await this.getUserById(comment.authorId);

    return {
      id: comment.id,
      content: comment.content,
      taskId: comment.taskId,
      authorId: comment.authorId,
      author: author || { id: comment.authorId, email: 'Unknown', username: 'Unknown' },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  private async getUserById(userId: string): Promise<AssigneeResponse | null> {
    try {
      const user = await firstValueFrom(
        this.authService.send({ cmd: 'get_user_by_id' }, { userId }),
      );
      return user;
    } catch (error) {
      return null;
    }
  }

  private async getUsersByIds(userIds: string[]): Promise<AssigneeResponse[]> {
    if (userIds.length === 0) {
      return [];
    }

    try {
      const users = await firstValueFrom(
        this.authService.send({ cmd: 'get_users_by_ids' }, { userIds }),
      );
      return users;
    } catch (error) {
      return [];
    }
  }
}
