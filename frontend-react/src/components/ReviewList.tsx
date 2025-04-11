import type React from 'react';
import type { ReviewType } from '../types';
import Review from './Review';

interface ReviewListProps {
  reviews: ReviewType[];
  currentUserId?: string;
  onSave: (reviewId: string, rating: number, content: string) => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews, currentUserId, onSave }) => {
  return (
    <div className="reviews-container">
      {reviews.map((review) => (
        <Review
          key={review._id}
          id={review._id}
          name={review.userName}
          rating={review.rating}
          date={new Date(review.createdAt).toLocaleDateString()}
          comment={review.content}
          canEdit={currentUserId === review.userId}
          onSave={onSave}
        />
      ))}
    </div>
  );
};

export default ReviewList;
