import React from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  name: string;
  onChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, maxRating = 5, name, onChange }) => {
  return (
    <div className="input-star-rating">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = maxRating - index;
        return (
          <React.Fragment key={starValue}>
            <input
              type="radio"
              id={`star${starValue}-${name}`}
              name={`rating-${name}`}
              value={starValue}
              checked={rating === starValue}
              onChange={onChange ? () => onChange(starValue) : undefined}
              disabled={!onChange}
            />
            <label htmlFor={`star${starValue}-${name}`} title={`${starValue} stars`} />
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StarRating;