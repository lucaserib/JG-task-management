import { Link } from '@tanstack/react-router';
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
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar';
import { NotificationBell } from '@/presentation/components/features/NotificationBell';
import { LogOut, User, Settings } from 'lucide-react';

interface NavbarProps {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  notifications?: NotificationResponse[];
  unreadCount?: number;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onDeleteNotification?: (notificationId: string) => void;
  onClearAllNotifications?: () => void;
  onNotificationClick?: (notification: NotificationResponse) => void;
  onLogout?: () => void;
}

export function Navbar({
  user,
  notifications = [],
  unreadCount = 0,
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onDeleteNotification = () => {},
  onClearAllNotifications = () => {},
  onNotificationClick = () => {},
  onLogout = () => {},
}: NavbarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover">
              <span className="text-lg font-bold text-primary-foreground">JG</span>
            </div>
            <span className="hidden text-xl font-bold sm:inline-block">
              Jungle Gaming
            </span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/tasks"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Tasks
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={onMarkAsRead}
                onMarkAllAsRead={onMarkAllAsRead}
                onDelete={onDeleteNotification}
                onClearAll={onClearAllNotifications}
                onNotificationClick={onNotificationClick}
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
