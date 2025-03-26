import type React from 'react';
import Review from './Review';

interface ReviewListProps {
  reviews: {
    name: string;
    rating: number;
    date: string;
    comment: string;
    canEdit: boolean;
  }[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  return (
    <div className="reviews-container">
      {reviews.map((review) => (
        <Review
          key={review.name}
          name={review.name}
          rating={review.rating}
          date={review.date}
          comment={review.comment}
          canEdit={review.canEdit}
        />
      ))}
    </div>
  );
};

export default ReviewList;
