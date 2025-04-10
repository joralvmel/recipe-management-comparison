import React from 'react';
import { useAuth } from '../context/AuthContext';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { useReviews } from '../hooks/useReviews';

interface ReviewSectionProps {
  recipeId: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ recipeId }) => {
  const { user, isSignedIn } = useAuth();
  const { reviews, loading, error, addNewReview, updateExistingReview } = useReviews(recipeId);

  const handleReviewAdded = async (rating: number, content: string) => {
    if (!user?.token) return;
    await addNewReview(rating, content, `Bearer ${user.token}`);
  };

  const handleReviewUpdated = async (reviewId: string, rating: number, content: string) => {
    if (!user?.token) return;
    await updateExistingReview(reviewId, rating, content, `Bearer ${user.token}`);
  };

  const userReview = isSignedIn
    ? reviews.find((review) => review.userId === user?.id)
    : null;

  return (
    <div className="review-section">
      {loading && <p>Loading reviews...</p>}
      {error && <p className="error-message">{error}</p>}
      {isSignedIn && !userReview && (
        <ReviewForm recipeId={recipeId} onSubmit={handleReviewAdded} />
      )}
      <ReviewList
        reviews={reviews}
        currentUserId={user?.id}
        onSave={handleReviewUpdated}
      />
    </div>
  );
};

export default ReviewSection;
