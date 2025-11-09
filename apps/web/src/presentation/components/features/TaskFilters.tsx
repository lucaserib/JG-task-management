import { useState, useEffect } from 'react';
import { TaskStatus, TaskPriority } from '@/domain/entities';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { Button } from '@/presentation/components/ui/button';
import { Search, X } from 'lucide-react';

export interface TaskFiltersState {
  search: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

interface TaskFiltersProps {
  onFiltersChange: (filters: TaskFiltersState) => void;
  initialFilters?: TaskFiltersState;
}

export function TaskFilters({ onFiltersChange, initialFilters }: TaskFiltersProps) {
  const [filters, setFilters] = useState<TaskFiltersState>(
    initialFilters || {
      search: '',
      status: undefined,
      priority: undefined,
    },
  );
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== filters.search) {
        const newFilters = { ...filters, search: searchInput };
        setFilters(newFilters);
        onFiltersChange(newFilters);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleStatusChange = (value: string) => {
    const newFilters = {
      ...filters,
      status: value === 'all' ? undefined : (value as TaskStatus),
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriorityChange = (value: string) => {
    const newFilters = {
      ...filters,
      priority: value === 'all' ? undefined : (value as TaskPriority),
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      status: undefined,
      priority: undefined,
    };
    setSearchInput('');
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = filters.search || filters.status || filters.priority;

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-8 px-2">
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Search tasks..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                <SelectItem value={TaskStatus.REVIEW}>In Review</SelectItem>
                <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={filters.priority || 'all'} onValueChange={handlePriorityChange}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                <SelectItem value={TaskPriority.URGENT}>Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
