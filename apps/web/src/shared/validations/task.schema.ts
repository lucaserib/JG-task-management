import { z } from 'zod';
import { TaskPriority, TaskStatus } from '@/domain/entities';

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  dueDate: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return date >= new Date(new Date().setHours(0, 0, 0, 0));
      },
      { message: 'Due date must be in the future' },
    )
    .optional(),
  priority: z.nativeEnum(TaskPriority, {
    errorMap: () => ({ message: 'Please select a valid priority' }),
  }),
  status: z.nativeEnum(TaskStatus, {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),
  assigneeIds: z.array(z.string()).optional().default([]),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  dueDate: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return date >= new Date(new Date().setHours(0, 0, 0, 0));
      },
      { message: 'Due date must be in the future' },
    )
    .optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  assigneeIds: z.array(z.string()).optional(),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;
