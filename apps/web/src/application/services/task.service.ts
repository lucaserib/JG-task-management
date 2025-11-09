import type { ITaskRepository } from '../../domain/repositories';
import type {
  TaskResponse,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilters,
  PaginatedResponse,
  CommentResponse,
  CreateCommentDto,
  TaskHistoryResponse,
} from '../../domain/entities';
import { tasksApi } from '../../infrastructure/http';

export class TaskService {
  private taskRepository: ITaskRepository;

  constructor(taskRepository?: ITaskRepository) {
    this.taskRepository = taskRepository ?? tasksApi;
  }

  async getTasks(filters?: TaskFilters): Promise<PaginatedResponse<TaskResponse>> {
    return this.taskRepository.getTasks(filters);
  }

  async getTaskById(id: string): Promise<TaskResponse> {
    return this.taskRepository.getTaskById(id);
  }

  async createTask(data: CreateTaskDto): Promise<TaskResponse> {
    if (data.dueDate && new Date(data.dueDate) < new Date()) {
      throw new Error('Due date cannot be in the past');
    }

    return this.taskRepository.createTask(data);
  }

  async updateTask(id: string, data: UpdateTaskDto): Promise<TaskResponse> {
    if (data.dueDate && new Date(data.dueDate) < new Date()) {
      throw new Error('Due date cannot be in the past');
    }

    return this.taskRepository.updateTask(id, data);
  }

  async deleteTask(id: string): Promise<void> {
    return this.taskRepository.deleteTask(id);
  }

  async getTaskComments(taskId: string): Promise<CommentResponse[]> {
    return this.taskRepository.getTaskComments(taskId);
  }

  async addComment(taskId: string, content: string): Promise<CommentResponse> {
    if (!content.trim()) {
      throw new Error('Comment content cannot be empty');
    }

    return this.taskRepository.addComment({ taskId, content });
  }

  async deleteComment(taskId: string, commentId: string): Promise<void> {
    return this.taskRepository.deleteComment(taskId, commentId);
  }

  async getTaskHistory(taskId: string): Promise<TaskHistoryResponse[]> {
    return this.taskRepository.getTaskHistory(taskId);
  }

  async getMyTasks(
    filters?: Omit<TaskFilters, 'assigneeId'>,
  ): Promise<PaginatedResponse<TaskResponse>> {
    return this.taskRepository.getTasks(filters);
  }
}

export const taskService = new TaskService();
