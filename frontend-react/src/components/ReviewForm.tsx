import type React from 'react';
import useReviewForm from '../hooks/useReviewForm';
import StarRating from './StarRating';
import Button from './Button';

interface ReviewFormProps {
  recipeId: string;
  onSubmit: (rating: number, content: string) => Promise<void>;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const {
    rating,
    comment,
    error,
    loading,
    handleRatingChange,
    handleCommentChange,
    handleSubmit,
  } = useReviewForm({ onSubmit });

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
          onChange={handleCommentChange}
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
