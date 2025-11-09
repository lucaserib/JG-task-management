import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { TaskResponse, TaskFilters } from '../../domain/entities';

interface TasksState {
  tasks: TaskResponse[];
  selectedTask: TaskResponse | null;
  filters: TaskFilters;
  isLoading: boolean;
  error: string | null;

  currentPage: number;
  totalPages: number;
  totalItems: number;

  setTasks: (tasks: TaskResponse[]) => void;
  addTask: (task: TaskResponse) => void;
  updateTask: (task: TaskResponse) => void;
  removeTask: (taskId: string) => void;
  setSelectedTask: (task: TaskResponse | null) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  resetFilters: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (page: number, totalPages: number, totalItems: number) => void;
  clearError: () => void;
}

const initialFilters: TaskFilters = {
  page: 1,
  size: 10,
};

export const useTasksStore = create<TasksState>()(
  devtools(
    (set, get) => ({
      tasks: [],
      selectedTask: null,
      filters: initialFilters,
      isLoading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,

      setTasks: (tasks) => set({ tasks }),

      addTask: (task) =>
        set((state) => ({
          tasks: [task, ...state.tasks],
          totalItems: state.totalItems + 1,
        })),

      updateTask: (updatedTask) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
          selectedTask:
            state.selectedTask?.id === updatedTask.id ? updatedTask : state.selectedTask,
        })),

      removeTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
          selectedTask: state.selectedTask?.id === taskId ? null : state.selectedTask,
          totalItems: state.totalItems - 1,
        })),

      setSelectedTask: (task) => set({ selectedTask: task }),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      resetFilters: () => set({ filters: initialFilters }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setPagination: (page, totalPages, totalItems) =>
        set({ currentPage: page, totalPages, totalItems }),

      clearError: () => set({ error: null }),
    }),
    { name: 'tasks-store' },
  ),
);
