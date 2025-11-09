import type { CommentResponse } from '@/domain/entities';
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar';
import { Button } from '@/presentation/components/ui/button';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CommentListProps {
  comments: CommentResponse[];
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function CommentList({
  comments,
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: CommentListProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: string) => {
    const commentDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - commentDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return commentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: commentDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/50 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No comments yet. Be the first to comment!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials(comment.author.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{comment.author.username}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(String(comment.createdAt))}
                  </span>
                </div>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
