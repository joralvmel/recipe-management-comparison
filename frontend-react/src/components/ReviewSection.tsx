import React from 'react';
import { reviews } from '../data/reviewData';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { useAuth } from '../context/AuthContext';

const ReviewSection: React.FC = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="review-section">
      {isSignedIn && <ReviewForm />}
      <ReviewList reviews={reviews} />
    </div>
  );
};

export default ReviewSection;
