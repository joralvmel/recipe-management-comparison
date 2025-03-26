import type React from 'react';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { reviews } from '../data/reviewData';

const ReviewSection: React.FC = () => {
  return (
    <div className="review-section">
      <ReviewForm />
      <ReviewList reviews={reviews} />
    </div>
  );
};

export default ReviewSection;
