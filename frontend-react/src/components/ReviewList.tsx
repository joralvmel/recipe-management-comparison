import type React from 'react';
import type { Review as ReviewType } from '../data/reviewData';
import { userData } from '../data/userData';
import Review from './Review';

interface ReviewListProps {
  reviews: ReviewType[];
  currentUserId?: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews, currentUserId }) => {
  return (
    <div className="reviews-container">
      {reviews.map((review) => {
        const user = userData.find((u) => u.id === review.userId);
        const displayName = user ? user.name : review.userId;
        return (
          <Review
            key={review._id}
            name={displayName}
            rating={review.rating}
            date={new Date(review.createdAt).toLocaleDateString()}
            comment={review.content}
            canEdit={currentUserId === review.userId}
          />
        );
      })}
    </div>
  );
};

export default ReviewList;
