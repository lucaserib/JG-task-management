import { useState } from 'react';
import type { NotificationResponse } from '@/domain/entities';
import { Button } from '@/presentation/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import { Badge } from '@/presentation/components/ui/badge';
import { Bell, Check, Trash2, MessageSquare, Edit, UserPlus } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface NotificationBellProps {
  notifications: NotificationResponse[];
  unreadCount: number;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (notificationId: string) => void;
  onClearAll: () => void;
  onNotificationClick: (notification: NotificationResponse) => void;
}

export function NotificationBell({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onNotificationClick,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const handleOpenChange = (open: boolean) => {
    if (!open && unreadCount > 0) {
      onMarkAllAsRead();
    }
    setIsOpen(open);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_COMMENT':
        return <MessageSquare className="h-4 w-4" />;
      case 'TASK_STATUS_CHANGED':
        return <Edit className="h-4 w-4" />;
      case 'TASK_ASSIGNED':
        return <UserPlus className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'NEW_COMMENT':
        return 'New Comment';
      case 'TASK_STATUS_CHANGED':
        return 'Task Updated';
      case 'TASK_ASSIGNED':
        return 'Task Assigned';
      default:
        return 'Notification';
    }
  };

  const formatDate = (date: string) => {
    const notifDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return notifDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 min-w-[1.25rem] px-1 text-xs animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between py-3">
          <div>
            <span className="text-base font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {unreadCount} unread
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAllAsRead();
              }}
              className="h-8 px-2 text-xs"
            >
              <Check className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {safeNotifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm font-medium text-muted-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground/70">You're all caught up!</p>
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            {safeNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  'flex cursor-pointer flex-col items-start gap-2 p-4 hover:bg-accent',
                  !notification.read && 'bg-primary/5 border-l-2 border-l-primary',
                )}
                onClick={() => {
                  onNotificationClick(notification);
                }}
              >
                <div className="flex w-full items-start gap-3">
                  <div
                    className={cn(
                      'mt-0.5 flex h-8 w-8 items-center justify-center rounded-full',
                      !notification.read ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                        {getNotificationTypeLabel(notification.type)}
                      </p>
                      <p className="text-xs text-muted-foreground shrink-0">
                        {formatDate(String(notification.createdAt))}
                      </p>
                    </div>

                    <p className={cn(
                      'text-sm leading-relaxed break-words',
                      !notification.read ? 'font-medium' : 'font-normal text-muted-foreground',
                    )}>
                      {notification.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete notification</span>
                    </Button>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        {safeNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-sm text-destructive hover:text-destructive hover:bg-destructive/10 py-3"
              onClick={onClearAll}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
