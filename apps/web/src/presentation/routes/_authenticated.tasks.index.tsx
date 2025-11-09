import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTasks, useCreateTask } from '../hooks';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { PageHeader } from '../components/layout';
import { TaskCard, TaskFilters, type TaskFiltersState } from '../components/features';
import { TaskForm } from '../components/forms/TaskForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Plus } from 'lucide-react';
import type { CreateTaskFormData } from '@/shared/validations';

export const Route = createFileRoute('/_authenticated/tasks/' as any)({
  component: TasksListPage,
});

function TasksListPage() {
  const [filters, setFilters] = useState<TaskFiltersState>({
    search: '',
    status: undefined,
    priority: undefined,
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data, isLoading, error } = useTasks(filters);
  const { mutateAsync: createTask, isPending: isCreating } = useCreateTask();

  const handleCreateTask = () => {
    setIsCreateDialogOpen(true);
  };

  const handleSubmitCreate = async (formData: CreateTaskFormData | any) => {
    try {
      console.log('Creating task with data:', formData);
      await createTask(formData as CreateTaskFormData);
      console.log('Task created successfully');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Failed to load tasks: {error.message}</p>
      </div>
    );
  }

  const tasks = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description={`${data?.meta.total || 0} total tasks`}
        action={{
          label: 'Create Task',
          onClick: handleCreateTask,
          icon: <Plus className="mr-2 h-4 w-4" />,
        }}
      />

      <TaskFilters onFiltersChange={setFilters} initialFilters={filters} />

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {filters.search || filters.status || filters.priority
                ? 'No tasks match your filters'
                : 'No tasks found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Fill in the details below to create a new task</DialogDescription>
          </DialogHeader>
          <TaskForm mode="create" onSubmit={handleSubmitCreate} isLoading={isCreating} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
