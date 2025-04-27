import type { ReviewType } from '@src/types';
import axios, { AxiosError } from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/reviews`;
const useBackend = import.meta.env.VITE_USE_BACKEND === 'true';

export const fetchReviews = async (recipeId: string): Promise<ReviewType[]> => {
  if (!useBackend) {
    const { reviews } = await import('@data/reviewData');
    return reviews.filter((review) => review.recipeId === recipeId);
  }

  try {
    const response = await axios.get<ReviewType[]>(`${API_URL}/${recipeId}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.error || 'Error fetching reviews');
    }
    throw new Error('Unable to fetch reviews');
  }
};

export const addReview = async (
  recipeId: string,
  rating: number,
  content: string,
  token: string
): Promise<ReviewType> => {
  if (!useBackend) {
    return {
      _id: crypto.randomUUID(),
      userId: 'mock-user-id',
      recipeId,
      rating,
      content,
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const response = await axios.post<ReviewType>(
      `${API_URL}/${recipeId}`,
      { rating, content },
      {
        headers: { Authorization: token },
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.error || 'Error adding review');
    }
    throw new Error('Unable to add review');
  }
};

export const updateReview = async (
  reviewId: string,
  rating: number,
  content: string,
  token: string
): Promise<ReviewType> => {
  try {
    const response = await axios.put<ReviewType>(
      `${API_URL}/${reviewId}`,
      { rating, content },
      {
        headers: { Authorization: token },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.error || 'Error updating review');
    }
    throw new Error('Unable to update review');
  }
};
