import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  createTaskSchema,
  updateTaskSchema,
  type CreateTaskFormData,
  type UpdateTaskFormData,
} from '@/shared/validations';
import { TaskPriority, TaskStatus } from '@/domain/entities';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Textarea } from '@/presentation/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { MultiSelect } from '@/presentation/components/ui/multi-select';
import { useUsers, useAuth } from '@/presentation/hooks';
import { Loader2 } from 'lucide-react';

interface TaskFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<CreateTaskFormData>;
  onSubmit: (data: CreateTaskFormData | UpdateTaskFormData) => Promise<void>;
  isLoading?: boolean;
}

export function TaskForm({ mode, initialData, onSubmit, isLoading = false }: TaskFormProps) {
  const schema = mode === 'create' ? createTaskSchema : updateTaskSchema;
  const { user: currentUser } = useAuth();
  const { data: usersData, isLoading: isLoadingUsers } = useUsers();

  const availableAssignees =
    mode === 'create' && currentUser
      ? usersData?.filter((user) => user.id !== currentUser.id) || []
      : usersData || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      title: '',
      description: '',
      dueDate: '',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      assigneeIds: [],
    },
  });

  const priority = watch('priority');
  const status = watch('status');
  const assigneeIds = watch('assigneeIds');

  const handleFormSubmit = async (data: CreateTaskFormData) => {
    console.log('=== TaskForm Submit ===');
    console.log('Form data:', data);
    console.log('Validation errors:', errors);
    console.log('Priority:', priority);
    console.log('Status:', status);

    try {
      await onSubmit(data);
      console.log('✅ onSubmit succeeded');
      toast.success(
        mode === 'create' ? 'Task created successfully!' : 'Task updated successfully!',
        {
          description: `Task "${data.title}" has been ${mode === 'create' ? 'created' : 'updated'}`,
        },
      );
    } catch (error) {
      console.error('❌ onSubmit failed:', error);
      toast.error(mode === 'create' ? 'Failed to create task' : 'Failed to update task', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit, (errors) => {
        console.error('❌ VALIDATION FAILED:', errors);
        toast.error('Validation Error', {
          description: 'Please check all required fields',
        });
      })}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          type="text"
          placeholder="Enter task title"
          disabled={isLoading}
          aria-invalid={errors.title ? 'true' : 'false'}
          aria-describedby={errors.title ? 'title-error' : undefined}
          {...register('title')}
        />
        {errors.title && (
          <p id="title-error" className="text-sm text-destructive" role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter task description"
          disabled={isLoading}
          aria-invalid={errors.description ? 'true' : 'false'}
          aria-describedby={errors.description ? 'description-error' : undefined}
          className="min-h-[120px]"
          {...register('description')}
        />
        {errors.description && (
          <p id="description-error" className="text-sm text-destructive" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            disabled={isLoading}
            aria-invalid={errors.dueDate ? 'true' : 'false'}
            aria-describedby={errors.dueDate ? 'dueDate-error' : undefined}
            {...register('dueDate')}
          />
          {errors.dueDate && (
            <p id="dueDate-error" className="text-sm text-destructive" role="alert">
              {errors.dueDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={priority}
            onValueChange={(value) => setValue('priority', value as TaskPriority)}
            disabled={isLoading}
          >
            <SelectTrigger
              id="priority"
              aria-invalid={errors.priority ? 'true' : 'false'}
              aria-describedby={errors.priority ? 'priority-error' : undefined}
            >
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
              <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
              <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
              <SelectItem value={TaskPriority.URGENT}>Urgent</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority && (
            <p id="priority-error" className="text-sm text-destructive" role="alert">
              {errors.priority.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={status}
          onValueChange={(value) => setValue('status', value as TaskStatus)}
          disabled={isLoading}
        >
          <SelectTrigger
            id="status"
            aria-invalid={errors.status ? 'true' : 'false'}
            aria-describedby={errors.status ? 'status-error' : undefined}
          >
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
            <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
            <SelectItem value={TaskStatus.REVIEW}>In Review</SelectItem>
            <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <p id="status-error" className="text-sm text-destructive" role="alert">
            {errors.status.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignees">Assign to</Label>
        <MultiSelect
          options={availableAssignees.map((user) => ({
            value: user.id,
            label: user.username,
          }))}
          value={assigneeIds || []}
          onChange={(value) => setValue('assigneeIds', value)}
          placeholder={mode === 'create' ? 'Select team members...' : 'Select assignees...'}
          disabled={isLoading || isLoadingUsers}
        />
        {errors.assigneeIds && (
          <p className="text-sm text-destructive" role="alert">
            {errors.assigneeIds.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          onClick={() => console.log('🔘 Submit button clicked')}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : mode === 'create' ? (
            'Create Task'
          ) : (
            'Update Task'
          )}
        </Button>
      </div>
    </form>
  );
}
