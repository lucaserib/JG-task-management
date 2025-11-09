import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
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
  TaskResponse,
  CommentResponse,
  PaginatedResponse,
  UserPayload,
} from '@repo/types';
import { CreateTaskDto, UpdateTaskDto, CreateCommentDto } from '../dtos/task.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TasksController {
  constructor(
    @Inject('TASKS_SERVICE') private readonly tasksService: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'priority', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  async getTasks(
    @Query('page') page = 1,
    @Query('size') size = 10,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
    @CurrentUser() user?: UserPayload,
  ): Promise<PaginatedResponse<TaskResponse>> {
    try {
      return await firstValueFrom(
        this.tasksService.send(
          { cmd: 'get_tasks' },
          { page, size, status, priority, search, userId: user?.id },
        ),
      );
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to get tasks',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getTaskById(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<TaskResponse> {
    try {
      return await firstValueFrom(
        this.tasksService.send({ cmd: 'get_task_by_id' }, { id, userId: user.id }),
      );
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Task not found',
        error instanceof HttpException ? error.getStatus() : HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: UserPayload,
  ): Promise<TaskResponse> {
    try {
      return await firstValueFrom(
        this.tasksService.send(
          { cmd: 'create_task' },
          { ...createTaskDto, creatorId: user.id },
        ),
      );
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to create task',
        error instanceof HttpException ? error.getStatus() : HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: UserPayload,
  ): Promise<TaskResponse> {
    try {
      return await firstValueFrom(
        this.tasksService.send(
          { cmd: 'update_task' },
          { id, ...updateTaskDto, userId: user.id },
        ),
      );
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to update task',
        error instanceof HttpException ? error.getStatus() : HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async deleteTask(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<{ message: string }> {
    try {
      return await firstValueFrom(
        this.tasksService.send({ cmd: 'delete_task' }, { id, userId: user.id }),
      );
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to delete task',
        error instanceof HttpException ? error.getStatus() : HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Create comment on task' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async createComment(
    @Param('id') taskId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: UserPayload,
  ): Promise<CommentResponse> {
    try {
      return await firstValueFrom(
        this.tasksService.send(
          { cmd: 'create_comment' },
          { ...createCommentDto, taskId, authorId: user.id },
        ),
      );
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to create comment',
        error instanceof HttpException ? error.getStatus() : HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get comments for task' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  async getComments(
    @Param('id') taskId: string,
    @Query('page') page = 1,
    @Query('size') size = 10,
    @CurrentUser() user: UserPayload,
  ): Promise<PaginatedResponse<CommentResponse>> {
    try {
      return await firstValueFrom(
        this.tasksService.send(
          { cmd: 'get_comments' },
          { taskId, page, size, userId: user.id },
        ),
      );
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to get comments',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get task history' })
  @ApiResponse({ status: 200, description: 'Task history retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getTaskHistory(
    @Param('id') taskId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<any[]> {
    try {
      return await firstValueFrom(
        this.tasksService.send(
          { cmd: 'get_task_history' },
          { taskId, userId: user.id },
        ),
      );
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to get task history',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
