import type React from 'react';
import { useState } from 'react';
import StarRating from './StarRating';
import Button from './Button';

interface ReviewFormProps {
  recipeId: string;
  onSubmit: (rating: number, content: string) => Promise<void>;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(rating, comment); // Llamar la función onSubmit pasada como prop
      setRating(0);
      setComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <label htmlFor="review">Leave a Review</label>
      <div className="rating">
        <label htmlFor="rating">Rating:</label>
        <StarRating rating={rating} name="review-form" onRatingChange={handleRatingChange} />
      </div>
      <div className="comment">
        <label htmlFor="comment">Comment:</label>
        <textarea
          className="input-textarea"
          id="comment"
          name="comment"
          rows={4}
          placeholder="Write your review here..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      {error && <p className="error-message">{error}</p>}
      <Button size="medium" type="primary" htmlType="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};

export default ReviewForm;
