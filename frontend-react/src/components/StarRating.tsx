import type React from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  name: string;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, maxRating = 5, onRatingChange, readOnly = false }) => {
  return (
    <div className={`input-star-rating ${readOnly ? 'read-only' : ''}`}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = maxRating - index;
        return (
          <span
            key={starValue}
            className={`star ${rating >= starValue ? 'filled' : ''}`}
            onClick={!readOnly && onRatingChange ? () => onRatingChange(starValue) : undefined}
            onKeyUp={!readOnly && onRatingChange ? (e) => (e.key === 'Enter' || e.key === ' ') && onRatingChange(starValue) : undefined}
            title={`${starValue} stars`}
          >
            &#9733;
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
