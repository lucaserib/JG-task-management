import { Link } from '@tanstack/react-router';
import type { TaskResponse } from '@/domain/entities';
import { TaskStatus, TaskPriority } from '@/domain/entities';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { Badge } from '@/presentation/components/ui/badge';
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface TaskCardProps {
  task: TaskResponse;
}

const statusConfig = {
  [TaskStatus.TODO]: { label: 'To Do', variant: 'outline' as const },
  [TaskStatus.IN_PROGRESS]: { label: 'In Progress', variant: 'info' as const },
  [TaskStatus.REVIEW]: { label: 'In Review', variant: 'warning' as const },
  [TaskStatus.DONE]: { label: 'Done', variant: 'success' as const },
};

const priorityConfig = {
  [TaskPriority.LOW]: { label: 'Low', color: 'text-blue-500' },
  [TaskPriority.MEDIUM]: { label: 'Medium', color: 'text-yellow-500' },
  [TaskPriority.HIGH]: { label: 'High', color: 'text-orange-500' },
  [TaskPriority.URGENT]: { label: 'Urgent', color: 'text-red-500' },
};

export function TaskCard({ task }: TaskCardProps) {
  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE : false;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Link
      to="/tasks/$taskId"
      params={{ taskId: task.id }}
      className="block transition-all hover:scale-[1.02]"
    >
      <Card className="group cursor-pointer transition-all hover:shadow-jungle-glow hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {task.title}
            </CardTitle>
            <Badge variant={statusConfig[task.status].variant}>
              {statusConfig[task.status].label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>

          <div className="flex items-center gap-4 text-sm">
            <div
              className={cn(
                'flex items-center gap-1.5',
                isOverdue ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {isOverdue ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              <span className={cn(isOverdue && 'font-semibold')}>
                {task.dueDate ? formatDate(String(task.dueDate)) : 'No due date'}
              </span>
            </div>

            <div className={cn('flex items-center gap-1.5', priorityConfig[task.priority].color)}>
              <Clock className="h-4 w-4" />
              <span className="font-medium">{priorityConfig[task.priority].label}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          {task.assignees && task.assignees.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Assignees:</span>
              <div className="flex -space-x-2">
                {task.assignees.slice(0, 3).map((assignee) => (
                  <Avatar
                    key={assignee.id}
                    className="h-7 w-7 border-2 border-background"
                  >
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {getInitials(assignee.username)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {task.assignees.length > 3 && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                    +{task.assignees.length - 3}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No assignees</span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
