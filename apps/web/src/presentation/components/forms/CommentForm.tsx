import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { createCommentSchema, type CreateCommentFormData } from '@/shared/validations';
import { Button } from '@/presentation/components/ui/button';
import { Textarea } from '@/presentation/components/ui/textarea';
import { Label } from '@/presentation/components/ui/label';
import { Loader2, Send } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (data: CreateCommentFormData) => Promise<void>;
  isLoading?: boolean;
  placeholder?: string;
}

export function CommentForm({
  onSubmit,
  isLoading = false,
  placeholder = 'Add a comment...',
}: CommentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCommentFormData>({
    resolver: zodResolver(createCommentSchema),
  });

  const handleFormSubmit = async (data: CreateCommentFormData) => {
    try {
      await onSubmit(data);
      reset();
      toast.success('Comment added successfully!');
    } catch (error) {
      toast.error('Failed to add comment', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content" className="sr-only">
          Comment
        </Label>
        <Textarea
          id="content"
          placeholder={placeholder}
          disabled={isLoading}
          aria-invalid={errors.content ? 'true' : 'false'}
          aria-describedby={errors.content ? 'content-error' : undefined}
          className="min-h-[100px] resize-none"
          {...register('content')}
        />
        {errors.content && (
          <p id="content-error" className="text-sm text-destructive" role="alert">
            {errors.content.message}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} size="sm">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Post Comment
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
