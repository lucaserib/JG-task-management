import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { TaskPriority, TaskStatus, type TaskResponse } from '@/domain/entities';
import { Calendar, User, Edit, Clock, Trash2 } from 'lucide-react';

interface TaskDetailsProps {
  task: TaskResponse;
  onEdit?: () => void;
  onDelete?: () => void;
}

const priorityConfig = {
  [TaskPriority.LOW]: {
    label: 'Low',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  [TaskPriority.MEDIUM]: {
    label: 'Medium',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  [TaskPriority.HIGH]: {
    label: 'High',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  },
  [TaskPriority.URGENT]: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
};

const statusConfig = {
  [TaskStatus.TODO]: {
    label: 'To Do',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  },
  [TaskStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  [TaskStatus.REVIEW]: {
    label: 'In Review',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
  [TaskStatus.DONE]: {
    label: 'Done',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
};

export function TaskDetails({ task, onEdit, onDelete }: TaskDetailsProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge className={priorityConfig[task.priority].color}>
                {priorityConfig[task.priority].label}
              </Badge>
              <Badge className={statusConfig[task.status].color}>
                {statusConfig[task.status].label}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="animate-pulse">
                  Overdue
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" onClick={onEdit} className="shrink-0">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                onClick={onDelete}
                className="shrink-0 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Description
          </h3>
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {task.description || (
              <span className="text-muted-foreground italic">No description provided</span>
            )}
          </p>
        </div>

        <div className="h-px bg-border" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-muted-foreground">Due Date</h3>
              <p
                className={`mt-1 text-sm font-medium truncate ${isOverdue ? 'text-destructive' : ''}`}
              >
                {task.dueDate ? formatDate(task.dueDate) : 'Not set'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-muted-foreground">Created</h3>
              <p className="mt-1 text-sm font-medium truncate">{formatDateTime(task.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-muted-foreground">Last Updated</h3>
              <p className="mt-1 text-sm font-medium truncate">{formatDateTime(task.updatedAt)}</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <User className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Assignees ({task.assignees?.length || 0})
            </h3>
          </div>

          {task.assignees && task.assignees.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {task.assignees.map((assignee) => (
                <div
                  key={assignee.id}
                  className="flex items-center gap-2 rounded-lg border bg-card p-2 px-3 hover:bg-accent transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {getInitials(assignee.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-none">{assignee.username}</span>
                    <span className="text-xs text-muted-foreground">{assignee.email}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-center">
              <User className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No assignees yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
