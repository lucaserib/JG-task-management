import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateTaskDto,
  UpdateTaskDto,
  CreateCommentDto,
  TaskResponse,
  CommentResponse,
  PaginatedResponse,
  TaskFilters,
  TaskHistoryResponse,
} from '@repo/types';
import { TasksService } from './tasks.service';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @MessagePattern({ cmd: 'get_tasks' })
  async getTasks(@Payload() filters: TaskFilters & { userId?: string }): Promise<PaginatedResponse<TaskResponse>> {
    return this.tasksService.getTasks(filters);
  }

  @MessagePattern({ cmd: 'get_task_by_id' })
  async getTaskById(@Payload() data: { id: string; userId?: string }): Promise<TaskResponse> {
    return this.tasksService.getTaskById(data.id, data.userId);
  }

  @MessagePattern({ cmd: 'create_task' })
  async createTask(
    @Payload() data: CreateTaskDto & { creatorId: string },
  ): Promise<TaskResponse> {
    return this.tasksService.createTask(data);
  }

  @MessagePattern({ cmd: 'update_task' })
  async updateTask(
    @Payload() data: { id: string } & UpdateTaskDto & { userId: string },
  ): Promise<TaskResponse> {
    const { id, ...updateData } = data;
    return this.tasksService.updateTask(id, updateData);
  }

  @MessagePattern({ cmd: 'delete_task' })
  async deleteTask(@Payload() data: { id: string; userId?: string }): Promise<{ message: string }> {
    return this.tasksService.deleteTask(data.id, data.userId);
  }

  @MessagePattern({ cmd: 'create_comment' })
  async createComment(
    @Payload() data: CreateCommentDto & { taskId: string; authorId: string },
  ): Promise<CommentResponse> {
    return this.tasksService.createComment(data);
  }

  @MessagePattern({ cmd: 'get_comments' })
  async getComments(
    @Payload() data: { taskId: string; page?: number; size?: number; userId?: string },
  ): Promise<PaginatedResponse<CommentResponse>> {
    return this.tasksService.getComments(data.taskId, data.page, data.size, data.userId);
  }

  @MessagePattern({ cmd: 'get_task_history' })
  async getTaskHistory(@Payload() data: { taskId: string; userId?: string }): Promise<TaskHistoryResponse[]> {
    return this.tasksService.getTaskHistory(data.taskId, data.userId);
  }
}
