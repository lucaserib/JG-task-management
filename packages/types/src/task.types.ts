export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate?: Date | string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeIds?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  dueDate?: Date | string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assigneeIds?: string[];
}

export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date | string;
  priority: TaskPriority;
  status: TaskStatus;
  creatorId: string;
  assignees: AssigneeResponse[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AssigneeResponse {
  id: string;
  email: string;
  username: string;
}

export interface CreateCommentDto {
  content: string;
  taskId: string;
}

export interface CommentResponse {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author: AssigneeResponse;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface TaskHistoryResponse {
  id: string;
  taskId: string;
  userId: string;
  user: AssigneeResponse;
  action: string;
  changes: Record<string, any>;
  createdAt: Date | string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export interface TaskFilters {
  page?: number;
  size?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  search?: string;
}
