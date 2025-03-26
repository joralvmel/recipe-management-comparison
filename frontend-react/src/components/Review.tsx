import type React from 'react';
import StarRating from './StarRating';
import Button from './Button';

interface ReviewProps {
  name: string;
  rating: number;
  date: string;
  comment: string;
  canEdit: boolean;
}

const Review: React.FC<ReviewProps> = ({ name, rating, date, comment, canEdit }) => {
  return (
    <div className="review">
      <div className="review-header">
        <div className="rating">
          <label htmlFor={`review-${name}`}>{name}:</label>
          <StarRating rating={rating} name={name} onChange={undefined} />
        </div>
        <div className="date-edit">
          <div className="review-date">{date}</div>
          {canEdit && <Button size="small" type="secondary">Edit</Button>}
        </div>
      </div>
      <p className="review-comment">{comment}</p>
    </div>
  );
};

export default Review;
