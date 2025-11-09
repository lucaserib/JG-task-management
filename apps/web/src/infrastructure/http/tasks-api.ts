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
import { apiClient } from './api-client';
import { API_ENDPOINTS } from '../../shared/config/api.config';
import { extractErrorMessage } from './error-handler';

export class TasksApi implements ITaskRepository {
  async getTasks(filters?: TaskFilters): Promise<PaginatedResponse<TaskResponse>> {
    try {
      const response = await apiClient.get<PaginatedResponse<TaskResponse>>(
        API_ENDPOINTS.TASKS.BASE,
        { params: filters },
      );
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  async getTaskById(id: string): Promise<TaskResponse> {
    try {
      const response = await apiClient.get<TaskResponse>(API_ENDPOINTS.TASKS.BY_ID(id));
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  async createTask(data: CreateTaskDto): Promise<TaskResponse> {
    try {
      const response = await apiClient.post<TaskResponse>(API_ENDPOINTS.TASKS.BASE, data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  async updateTask(id: string, data: UpdateTaskDto): Promise<TaskResponse> {
    try {
      const response = await apiClient.put<TaskResponse>(API_ENDPOINTS.TASKS.BY_ID(id), data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.TASKS.BY_ID(id));
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  async getTaskComments(taskId: string): Promise<CommentResponse[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<CommentResponse>>(
        API_ENDPOINTS.TASKS.COMMENTS(taskId),
      );
      return response.data.data || [];
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  async addComment(data: CreateCommentDto): Promise<CommentResponse> {
    try {
      const response = await apiClient.post<CommentResponse>(
        API_ENDPOINTS.TASKS.COMMENTS(data.taskId),
        { content: data.content },
      );
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  async deleteComment(taskId: string, commentId: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.TASKS.COMMENT_BY_ID(taskId, commentId));
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  async getTaskHistory(taskId: string): Promise<TaskHistoryResponse[]> {
    try {
      const response = await apiClient.get<TaskHistoryResponse[]>(
        API_ENDPOINTS.TASKS.HISTORY(taskId),
      );
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }
}

export const tasksApi = new TasksApi();
