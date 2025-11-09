import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/presentation/components/ui/alert-dialog';
import { useDeleteTask } from '@/presentation/hooks';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface DeleteTaskDialogProps {
  taskId: string;
  taskTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteTaskDialog({
  taskId,
  taskTitle,
  open,
  onOpenChange,
  onSuccess,
}: DeleteTaskDialogProps) {
  const deleteTaskMutation = useDeleteTask();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      toast.success('Task deleted successfully', {
        description: `"${taskTitle}" has been permanently deleted`,
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to delete task', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the task
            <span className="font-semibold text-foreground"> "{taskTitle}"</span> and all
            its associated comments and history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Task'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
