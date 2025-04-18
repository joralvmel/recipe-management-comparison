import { useState, useCallback } from 'react';

interface UseReviewFormProps {
  onSubmit: (rating: number, content: string) => Promise<void>;
}

const useReviewForm = ({ onSubmit }: UseReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRatingChange = useCallback((newRating: number) => {
    setRating(newRating);
  }, []);

  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        await onSubmit(rating, comment);
        setRating(0);
        setComment('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unexpected error occurred');
      } finally {
        setLoading(false);
      }
    },
    [onSubmit, rating, comment]
  );

  return {
    rating,
    comment,
    error,
    loading,
    handleRatingChange,
    handleCommentChange,
    handleSubmit,
  };
};

export default useReviewForm;
