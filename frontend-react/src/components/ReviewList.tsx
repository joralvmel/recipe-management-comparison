import type React from 'react';
import type { ReviewType } from '@src//types';
import Review from '@components//Review';
import useLazyLoad from '@hooks/useLazyLoad';
import '@styles/components/_inputs.scss';

interface ReviewListProps {
  reviews: ReviewType[];
  currentUserId?: string;
  onSave: (reviewId: string, rating: number, content: string) => void;
}

const ReviewItem: React.FC<{
  review: ReviewType;
  currentUserId?: string;
  onSave: (reviewId: string, rating: number, content: string) => void;
}> = ({ review, currentUserId, onSave }) => {
  const [isVisible, ref] = useLazyLoad<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '200px',
    triggerOnce: true,
  });

  return isVisible ? (
    <Review
      ref={ref}
      id={review._id}
      userId={review.userId}
      rating={review.rating}
      date={new Date(review.createdAt).toLocaleDateString()}
      comment={review.content}
      canEdit={currentUserId === review.userId}
      onSave={onSave}
    />
  ) : (
    <div ref={ref} style={{ height: '150px' }} />
  );
};

const ReviewList: React.FC<ReviewListProps> = ({ reviews, currentUserId, onSave }) => {
  const useLazyLoading = reviews.length > 5;

  if (!useLazyLoading) {
    return (
      <div className="reviews-container">
        {reviews.map((review) => (
          <Review
            key={review._id}
            id={review._id}
            userId={review.userId}
            rating={review.rating}
            date={new Date(review.createdAt).toLocaleDateString()}
            comment={review.content}
            canEdit={currentUserId === review.userId}
            onSave={onSave}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="reviews-container">
      {reviews.map((review) => (
        <ReviewItem
          key={review._id}
          review={review}
          currentUserId={currentUserId}
          onSave={onSave}
        />
      ))}
    </div>
  );
};

export default ReviewList;
