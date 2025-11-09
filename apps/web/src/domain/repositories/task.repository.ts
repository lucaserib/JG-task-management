import type {
  TaskResponse,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilters,
  PaginatedResponse,
  CommentResponse,
  CreateCommentDto,
  TaskHistoryResponse,
} from '../entities';

export interface ITaskRepository {
  getTasks(filters?: TaskFilters): Promise<PaginatedResponse<TaskResponse>>;

  getTaskById(id: string): Promise<TaskResponse>;

  createTask(data: CreateTaskDto): Promise<TaskResponse>;

  updateTask(id: string, data: UpdateTaskDto): Promise<TaskResponse>;

  deleteTask(id: string): Promise<void>;

  getTaskComments(taskId: string): Promise<CommentResponse[]>;

  addComment(data: CreateCommentDto): Promise<CommentResponse>;

  deleteComment(taskId: string, commentId: string): Promise<void>;

  getTaskHistory(taskId: string): Promise<TaskHistoryResponse[]>;
}
