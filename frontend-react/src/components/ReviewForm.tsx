import type React from 'react';
import { useState } from 'react';
import StarRating from './StarRating';
import Button from './Button';

interface ReviewFormProps {
  recipeId: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ recipeId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    console.log(`Selected rating: ${newRating}`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(`Submitting review for recipe ${recipeId}:`, { rating, comment });
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
      <Button size="medium" type="primary" htmlType="submit">
        Submit Review
      </Button>
    </form>
  );
};

export default ReviewForm;
