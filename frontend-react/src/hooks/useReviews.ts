import type { ReviewType } from '../types';
import { useState, useEffect, useCallback } from 'react';
import { fetchReviews, addReview, updateReview } from '../services/reviewService';
import { useSnackbar } from '../context/SnackbarContext';

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
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      setError(null);

      try {
        const fetchedReviews = await fetchReviews(recipeId);
        setReviews(fetchedReviews);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load reviews';
        setError(errorMessage);
        showSnackbar(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [recipeId, showSnackbar]);

  const addNewReview = useCallback(async (rating: number, content: string, token: string) => {
    try {
      const newReview = await addReview(recipeId, rating, content, token);
      setReviews((prevReviews) => [...prevReviews, newReview]);
      showSnackbar('Review added successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add review';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    }
  }, [recipeId, showSnackbar]);

  const updateExistingReview = useCallback(async (reviewId: string, rating: number, content: string, token: string) => {
    try {
      const updatedReview = await updateReview(reviewId, rating, content, token);
      setReviews((prevReviews) =>
        prevReviews.map((review) => (review._id === reviewId ? updatedReview : review))
      );
      showSnackbar('Review updated successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update review';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    }
  }, [showSnackbar]);

  return {
    reviews,
    loading,
    error,
    addNewReview,
    updateExistingReview,
  };
};
