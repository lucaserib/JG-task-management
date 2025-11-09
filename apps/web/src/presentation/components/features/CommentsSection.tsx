import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Skeleton } from '../ui/skeleton';
import { useAddComment } from '../../hooks';
import type { CommentResponse } from '@/domain/entities';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CommentsSectionProps {
  taskId: string;
  comments: CommentResponse[];
  isLoading?: boolean;
}

export function CommentsSection({ taskId, comments, isLoading }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const addCommentMutation = useAddComment();

  const safeComments = Array.isArray(comments) ? comments : [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDateTime = (date: string | Date) => {
    const commentDate = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return commentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: commentDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      await addCommentMutation.mutateAsync({ taskId, content: newComment });
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Comments ({safeComments.length})</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-[80px] resize-none"
            disabled={addCommentMutation.isPending}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={addCommentMutation.isPending || !newComment.trim()}
              size="sm"
            >
              {addCommentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-2">
          {isLoading ? (
            <>
              <CommentSkeleton />
              <CommentSkeleton />
              <CommentSkeleton />
            </>
          ) : safeComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm font-medium text-muted-foreground">No comments yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Be the first to comment on this task
              </p>
            </div>
          ) : (
            safeComments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(comment.author.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold">{comment.author.username}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CommentSkeleton() {
  return (
    <div className="flex gap-3 p-3">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
