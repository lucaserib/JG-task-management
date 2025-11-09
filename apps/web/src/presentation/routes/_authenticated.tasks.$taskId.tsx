import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTask, useTaskComments, useTaskHistory } from '../hooks';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
  TaskDetails,
  CommentsSection,
  TaskHistory,
  EditTaskDialog,
  DeleteTaskDialog,
} from '../components/features';

export const Route = createFileRoute('/_authenticated/tasks/$taskId' as any)({
  component: TaskDetailPage,
});

function TaskDetailPage() {
  const navigate = useNavigate();
  const { taskId } = Route.useParams();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: task, isLoading: isLoadingTask, error: taskError } = useTask(taskId);
  const { data: commentsData, isLoading: isLoadingComments } = useTaskComments(taskId);
  const { data: history, isLoading: isLoadingHistory } = useTaskHistory(taskId);

  const handleBack = () => {
    navigate({ to: '/tasks' });
  };

  const handleEditTask = () => {
    setIsEditDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    navigate({ to: '/tasks' });
  };

  if (isLoadingTask) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (taskError || !task) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tasks
        </Button>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{taskError?.message || 'Task not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tasks
        </Button>
      </div>

      <TaskDetails
        task={task}
        onEdit={handleEditTask}
        onDelete={() => setIsDeleteDialogOpen(true)}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CommentsSection
          taskId={taskId}
          comments={commentsData || []}
          isLoading={isLoadingComments}
        />

        <TaskHistory history={history || []} task={task} isLoading={isLoadingHistory} />
      </div>

      <EditTaskDialog task={task} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />

      <DeleteTaskDialog
        taskId={task.id}
        taskTitle={task.title}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
