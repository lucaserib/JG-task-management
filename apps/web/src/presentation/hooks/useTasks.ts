import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../../application/services';
import { useTasksStore } from '../stores';
import type {
  TaskFilters,
  CreateTaskDto,
  UpdateTaskDto,
  CreateCommentDto,
} from '../../domain/entities';

export const TASK_QUERY_KEYS = {
  all: ['tasks'] as const,
  lists: () => [...TASK_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: TaskFilters) => [...TASK_QUERY_KEYS.lists(), filters] as const,
  details: () => [...TASK_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TASK_QUERY_KEYS.details(), id] as const,
  comments: (taskId: string) => [...TASK_QUERY_KEYS.detail(taskId), 'comments'] as const,
  history: (taskId: string) => [...TASK_QUERY_KEYS.detail(taskId), 'history'] as const,
};

export const useTasks = (filters?: TaskFilters) => {
  const { setTasks, setLoading, setError, setPagination } = useTasksStore();

  return useQuery({
    queryKey: TASK_QUERY_KEYS.list(filters),
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await taskService.getTasks(filters);
        setTasks(response.data);
        setPagination(response.meta.page, response.meta.totalPages, response.meta.total);
        setError(null);
        return response;
      } catch (error: any) {
        setError(error.message || 'Failed to fetch tasks');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 30000,
  });
};

export const useTask = (taskId: string) => {
  const { setSelectedTask } = useTasksStore();

  return useQuery({
    queryKey: TASK_QUERY_KEYS.detail(taskId),
    queryFn: async () => {
      const task = await taskService.getTaskById(taskId);
      setSelectedTask(task);
      return task;
    },
    enabled: !!taskId,
    staleTime: 5000,
    refetchInterval: 10000,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { addTask } = useTasksStore();

  return useMutation({
    mutationFn: (data: CreateTaskDto) => taskService.createTask(data),
    onSuccess: (task) => {
      addTask(task);
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { updateTask } = useTasksStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskDto }) =>
      taskService.updateTask(id, data),
    onSuccess: (task) => {
      updateTask(task);
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(task.id) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const { removeTask } = useTasksStore();

  return useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    onSuccess: (_, taskId) => {
      removeTask(taskId);
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
    },
  });
};

export const useTaskComments = (taskId: string) => {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.comments(taskId),
    queryFn: () => taskService.getTaskComments(taskId),
    enabled: !!taskId,
    staleTime: 3000,
    refetchInterval: 8000,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, content }: { taskId: string; content: string }) =>
      taskService.addComment(taskId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.comments(variables.taskId) });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, commentId }: { taskId: string; commentId: string }) =>
      taskService.deleteComment(taskId, commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.comments(variables.taskId) });
    },
  });
};

export const useTaskHistory = (taskId: string) => {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.history(taskId),
    queryFn: () => taskService.getTaskHistory(taskId),
    enabled: !!taskId,
    staleTime: 5000,
    refetchInterval: 10000,
  });
};
