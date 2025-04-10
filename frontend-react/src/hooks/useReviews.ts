import { useState, useEffect } from 'react';
import { fetchReviews, addReview, updateReview } from '../services/reviewService';
import type { ReviewType } from '../types';

interface UseReviewsReturn {
  reviews: ReviewType[];
  loading: boolean;
  error: string | null;
  addNewReview: (rating: number, content: string, token: string) => Promise<void>;
  updateExistingReview: (reviewId: string, rating: number, content: string, token: string) => Promise<void>;
}

export const useReviews = (recipeId: string): UseReviewsReturn => {
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      setError(null);

      try {
        const fetchedReviews = await fetchReviews(recipeId);
        setReviews(fetchedReviews);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [recipeId]);

  const addNewReview = async (rating: number, content: string, token: string) => {
    try {
      const newReview = await addReview(recipeId, rating, content, token);
      setReviews((prevReviews) => [...prevReviews, newReview]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add review');
    }
  };

  const updateExistingReview = async (reviewId: string, rating: number, content: string, token: string) => {
    try {
      const updatedReview = await updateReview(reviewId, rating, content, token);
      setReviews((prevReviews) =>
        prevReviews.map((review) => (review._id === reviewId ? updatedReview : review))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update review');
    }
  };

  return {
    reviews,
    loading,
    error,
    addNewReview,
    updateExistingReview,
  };
};
