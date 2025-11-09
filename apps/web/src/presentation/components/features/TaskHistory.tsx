import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import type { TaskHistoryResponse } from '@/domain/entities';
import { History, FileEdit, MessageSquare, UserPlus, CheckCircle2 } from 'lucide-react';

interface TaskHistoryProps {
  history: TaskHistoryResponse[];
  task?: any;
  isLoading?: boolean;
}

const actionConfig: Record<string, { label: string; icon: typeof FileEdit; color: string }> = {
  CREATED: {
    label: 'created this task',
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
  },
  UPDATED: {
    label: 'updated this task',
    icon: FileEdit,
    color: 'text-blue-600 dark:text-blue-400',
  },
  COMMENT_ADDED: {
    label: 'added a comment',
    icon: MessageSquare,
    color: 'text-purple-600 dark:text-purple-400',
  },
  ASSIGNEE_ADDED: {
    label: 'assigned a user',
    icon: UserPlus,
    color: 'text-orange-600 dark:text-orange-400',
  },
};

export function TaskHistory({ history, task, isLoading }: TaskHistoryProps) {
  const safeHistory = Array.isArray(history) ? history : [];

  const assigneeMap = new Map<string, string>();
  if (task?.assignees) {
    task.assignees.forEach((assignee: any) => {
      assigneeMap.set(assignee.id, assignee.username);
    });
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDateTime = (date: string | Date) => {
    const historyDate = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - historyDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return historyDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: historyDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatValue = (value: any, fieldName: string = ''): string => {
    if (value === null || value === undefined) return 'None';

    if (typeof value === 'boolean') return value ? 'Yes' : 'No';

    if (typeof value === 'number') return value.toString();

    if (Array.isArray(value)) {
      if (value.length === 0) return 'None';

      const isUuidArray = value.every(
        (item) =>
          typeof item === 'string' &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item),
      );

      if (isUuidArray) {
        return value.map((uuid) => assigneeMap.get(uuid) || uuid.slice(0, 8) + '...').join(', ');
      }

      return value
        .map((item) =>
          typeof item === 'object' ? item.username || item.name || String(item) : String(item),
        )
        .join(', ');
    }

    if (typeof value === 'object') {
      if ('username' in value) return value.username;
      if ('name' in value) return value.name;
      if ('title' in value) return value.title;
      return Object.keys(value).length > 0
        ? Object.entries(value)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')
        : 'None';
    }

    if (typeof value === 'string') {
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return value.split('T')[0];
      }

      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
        const username = assigneeMap.get(value);
        if (username) return username;

        if (fieldName.toLowerCase().includes('comment')) {
          return value.slice(0, 8) + '...';
        }

        return value.slice(0, 8) + '...';
      }

      return value;
    }

    return String(value);
  };

  const renderChanges = (changes: Record<string, any>) => {
    const entries = Object.entries(changes);
    if (entries.length === 0) return null;

    return (
      <div className="mt-2 space-y-1">
        {entries.map(([key, value]) => {
          if (key.toLowerCase() === 'commentid') {
            return null;
          }

          if (typeof value === 'object' && value !== null && 'old' in value && 'new' in value) {
            return (
              <div key={key} className="text-xs text-muted-foreground">
                <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>:{' '}
                <span className="line-through opacity-70">{formatValue(value.old, key)}</span>
                {' → '}
                <span className="font-medium text-foreground">{formatValue(value.new, key)}</span>
              </div>
            );
          }
          return (
            <div key={key} className="text-xs text-muted-foreground">
              <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>:{' '}
              {formatValue(value, key)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">History ({safeHistory.length})</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="relative space-y-4 overflow-y-auto max-h-[500px] pr-2">
          {isLoading ? (
            <>
              <HistorySkeleton />
              <HistorySkeleton />
              <HistorySkeleton />
            </>
          ) : safeHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm font-medium text-muted-foreground">No history yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Task changes will appear here</p>
            </div>
          ) : (
            <>
              <div className="absolute left-5 top-3 bottom-3 w-px bg-border" />

              {safeHistory.map((entry, index) => {
                const config = actionConfig[entry.action] || {
                  label: entry.action.toLowerCase().replace('_', ' '),
                  icon: FileEdit,
                  color: 'text-gray-600 dark:text-gray-400',
                };
                const Icon = config.icon;

                return (
                  <div key={entry.id} className="relative flex gap-3 pl-1">
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-background bg-card">
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>

                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                              {getInitials(entry.user.username)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-semibold">{entry.user.username}</span>
                          <span className="text-sm text-muted-foreground">{config.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDateTime(entry.createdAt)}
                        </span>
                      </div>

                      {entry.changes && Object.keys(entry.changes).length > 0 && (
                        <div className="mt-2 rounded-lg border bg-muted/30 p-2">
                          {renderChanges(entry.changes)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function HistorySkeleton() {
  return (
    <div className="relative flex gap-3 pl-1">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2 pb-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
