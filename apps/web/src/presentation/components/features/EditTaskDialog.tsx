import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { TaskForm } from '@/presentation/components/forms/TaskForm';
import { useUpdateTask } from '@/presentation/hooks';
import type { TaskResponse } from '@/domain/entities';
import type { UpdateTaskFormData } from '@/shared/validations';

interface EditTaskDialogProps {
  task: TaskResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
  const updateTaskMutation = useUpdateTask();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: UpdateTaskFormData) => {
    setIsSubmitting(true);
    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        data,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const initialData = {
    title: task.title,
    description: task.description,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    priority: task.priority,
    status: task.status,
    assigneeIds: task.assignees?.map((a) => a.id) || [],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the task details below. All fields are optional except title.
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          mode="edit"
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
