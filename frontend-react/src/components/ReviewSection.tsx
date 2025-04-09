import type React from 'react';
import { useAuth } from '../context/AuthContext';
import { reviews as reviewData } from '../data/reviewData';
import type { ReviewType } from '../types';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

interface ReviewSectionProps {
  recipeId: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ recipeId }) => {
  const { user, isSignedIn } = useAuth();

  const recipeReviews: ReviewType[] = reviewData.filter(
    (review) => review.recipeId === recipeId
  );

  if (!isSignedIn && recipeReviews.length === 0) {
    return null;
  }

  const userReview = isSignedIn
    ? recipeReviews.find((review) => review.userId === user?.id)
    : null;

  return (
    <div className="review-section">
      {isSignedIn && !userReview && <ReviewForm recipeId={recipeId} />}
      <ReviewList reviews={recipeReviews} currentUserId={user?.id} />
    </div>
  );
};

export default ReviewSection;
