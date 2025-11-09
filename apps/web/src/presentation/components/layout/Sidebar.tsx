import { Link, useMatchRoute } from '@tanstack/react-router';
import { cn } from '@/shared/utils/cn';
import { CheckSquare, LayoutDashboard, ListTodo } from 'lucide-react';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'All Tasks',
    href: '/tasks',
    icon: ListTodo,
  },
  {
    title: 'My Tasks',
    href: '/tasks?filter=assigned',
    icon: CheckSquare,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const matchRoute = useMatchRoute();

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r border-border bg-background',
        className
      )}
    >
      <div className="flex h-full flex-col gap-2 p-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = matchRoute({ to: item.href });

            return (
              <Link
                key={item.href}
                to={item.href}
                search={{}}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
