import type React from 'react';
import { useState } from 'react';
import StarRating from './StarRating';
import Button from './Button';

const ReviewForm: React.FC = () => {
  const [rating, setRating] = useState(0);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    console.log(`Selected rating: ${newRating}`);
  };

  return (
    <form className="review-form">
      <label htmlFor="review">Leave a Review</label>
      <div className="rating">
        <label htmlFor="rating">Rating:</label>
        <StarRating rating={rating} name="review-form" onRatingChange={handleRatingChange} />
      </div>
      <div className="comment">
        <label htmlFor="comment">Comment:</label>
        <textarea className="input-textarea" id="comment" name="comment" rows={4} placeholder="Write your review here..." />
      </div>
      <Button size="medium" type="primary" htmlType="submit">Submit Review</Button>
    </form>
  );
};

export default ReviewForm;
