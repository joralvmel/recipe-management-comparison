import type { ReviewType } from '@src/types';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import * as reviewService from '@services/reviewService';

vi.mock('axios');

vi.mock('@services/reviewService', async (importOriginal) => {
  const actualModule = await importOriginal<typeof import('@services/reviewService')>();

  return {
    ...actualModule,
    fetchReviews: vi.fn(),
    addReview: vi.fn(),
    updateReview: vi.fn()
  };
});

interface MockAxiosError {
  isAxiosError: boolean;
  response?: {
    status?: number;
    data?: {
      error?: string;
      message?: string;
    };
  };
}

describe('reviewService', () => {
  const mockReviews: ReviewType[] = [
    {
      _id: 'review1',
      userId: 'user1',
      recipeId: 'recipe1',
      rating: 5,
      content: 'Amazing recipe! Will definitely make again.',
      createdAt: '2023-01-01T10:00:00Z'
    },
    {
      _id: 'review2',
      userId: 'user2',
      recipeId: 'recipe1',
      rating: 4,
      content: 'Really good, but I added more garlic.',
      createdAt: '2023-01-02T11:30:00Z'
    },
    {
      _id: 'review3',
      userId: 'user1',
      recipeId: 'recipe2',
      rating: 3,
      content: 'Decent recipe, but needs improvement.',
      createdAt: '2023-01-03T15:45:00Z'
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();

    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: vi.fn().mockReturnValue('mock-uuid')
      }
    });
  });

  describe('fetchReviews', () => {
    it('fetches reviews from API when backend is enabled', async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: mockReviews.filter(r => r.recipeId === 'recipe1')
      });

      (reviewService.fetchReviews as jest.Mock).mockImplementationOnce(async (recipeId: string) => {
        const response = await axios.get(`http://localhost:3000/reviews/${recipeId}`);
        return response.data;
      });

      const result = await reviewService.fetchReviews('recipe1');

      expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/reviews/recipe1');
      expect(result).toHaveLength(2);
      expect(result[0].recipeId).toBe('recipe1');
      expect(result[1].recipeId).toBe('recipe1');
    });

    it('filters reviews by recipeId when using mock data', async () => {
      (reviewService.fetchReviews as jest.Mock).mockImplementationOnce(async (recipeId: string) => {
        return mockReviews.filter(review => review.recipeId === recipeId);
      });

      const result = await reviewService.fetchReviews('recipe1');

      expect(result).toHaveLength(2);
      expect(result.every(r => r.recipeId === 'recipe1')).toBe(true);
    });

    it('returns empty array when no reviews exist for the recipe', async () => {
      (reviewService.fetchReviews as jest.Mock).mockImplementationOnce(async (recipeId: string) => {
        return mockReviews.filter(review => review.recipeId === recipeId);
      });

      const result = await reviewService.fetchReviews('recipe3');

      expect(result).toHaveLength(0);
    });

    it('handles API errors with response data', async () => {
      const mockError: MockAxiosError = {
        isAxiosError: true,
        response: {
          data: { error: 'Recipe not found' }
        }
      };

      (axios.get as jest.Mock).mockRejectedValueOnce(mockError);

      (reviewService.fetchReviews as jest.Mock).mockImplementationOnce(async (recipeId: string) => {
        try {
          const response = await axios.get(`http://localhost:3000/reviews/${recipeId}`);
          return response.data;
        } catch (error: unknown) {
          const axiosError = error as MockAxiosError;
          if (axiosError.isAxiosError && axiosError.response) {
            throw new Error(axiosError.response.data?.error || 'Error fetching reviews');
          }
          throw new Error('Unable to fetch reviews');
        }
      });

      await expect(reviewService.fetchReviews('nonexistent')).rejects.toThrow('Recipe not found');
    });

    it('handles API errors without response data', async () => {
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      (reviewService.fetchReviews as jest.Mock).mockImplementationOnce(async (recipeId: string) => {
        try {
          const response = await axios.get(`http://localhost:3000/reviews/${recipeId}`);
          return response.data;
        } catch (error: unknown) {
          const axiosError = error as MockAxiosError;
          if (axiosError.isAxiosError && axiosError.response) {
            throw new Error(axiosError.response.data?.error || 'Error fetching reviews');
          }
          throw new Error('Unable to fetch reviews');
        }
      });

      await expect(reviewService.fetchReviews('recipe1')).rejects.toThrow('Unable to fetch reviews');
    });
  });

  describe('addReview', () => {
    it('adds a review via API when backend is enabled', async () => {
      const newReview = {
        _id: 'new-review',
        userId: 'user1',
        recipeId: 'recipe1',
        rating: 5,
        content: 'Great recipe!',
        createdAt: '2023-04-15T14:30:00Z'
      };

      (axios.post as jest.Mock).mockResolvedValueOnce({ data: newReview });

      (reviewService.addReview as jest.Mock).mockImplementationOnce(
        async (recipeId: string, rating: number, content: string, token: string) => {
          const response = await axios.post(
            `http://localhost:3000/reviews/${recipeId}`,
            { rating, content },
            { headers: { Authorization: token } }
          );
          return response.data;
        }
      );

      const result = await reviewService.addReview(
        'recipe1',
        5,
        'Great recipe!',
        'Bearer token123'
      );

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3000/reviews/recipe1',
        { rating: 5, content: 'Great recipe!' },
        { headers: { Authorization: 'Bearer token123' } }
      );

      expect(result).toEqual(newReview);
    });

    it('creates a mock review when backend is disabled', async () => {
      (reviewService.addReview as jest.Mock).mockImplementationOnce(
        async (recipeId: string, rating: number, content: string) => {
          return {
            _id: 'mock-uuid',
            userId: 'mock-user-id',
            recipeId,
            rating,
            content,
            createdAt: expect.any(String)
          };
        }
      );

      const result = await reviewService.addReview(
        'recipe1',
        4,
        'Good recipe',
        'Bearer token123'
      );

      expect(result).toEqual({
        _id: 'mock-uuid',
        userId: 'mock-user-id',
        recipeId: 'recipe1',
        rating: 4,
        content: 'Good recipe',
        createdAt: expect.any(String)
      });
    });

    it('formats the createdAt date correctly when backend is disabled', async () => {
      (reviewService.addReview as jest.Mock).mockImplementationOnce(
        async (recipeId: string, rating: number, content: string) => {
          return {
            _id: 'mock-uuid',
            userId: 'mock-user-id',
            recipeId,
            rating,
            content,
            createdAt: new Date().toISOString()
          };
        }
      );

      const result = await reviewService.addReview('recipe1', 4, 'Good recipe', 'Bearer token123');

      expect(Date.parse(result.createdAt)).not.toBeNaN();
      expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('handles API errors with response data', async () => {
      const mockError: MockAxiosError = {
        isAxiosError: true,
        response: {
          data: { error: 'You have already reviewed this recipe' }
        }
      };

      (axios.post as jest.Mock).mockRejectedValueOnce(mockError);

      (reviewService.addReview as jest.Mock).mockImplementationOnce(
        async (recipeId: string, rating: number, content: string, token: string) => {
          try {
            const response = await axios.post(
              `http://localhost:3000/reviews/${recipeId}`,
              { rating, content },
              { headers: { Authorization: token } }
            );
            return response.data;
          } catch (error: unknown) {
            const axiosError = error as MockAxiosError;
            if (axiosError.isAxiosError && axiosError.response) {
              throw new Error(axiosError.response.data?.error || 'Error adding review');
            }
            throw new Error('Unable to add review');
          }
        }
      );

      await expect(
        reviewService.addReview('recipe1', 5, 'Great recipe!', 'Bearer token123')
      ).rejects.toThrow('You have already reviewed this recipe');
    });

    it('handles API errors without response data', async () => {
      (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      (reviewService.addReview as jest.Mock).mockImplementationOnce(
        async (recipeId: string, rating: number, content: string, token: string) => {
          try {
            const response = await axios.post(
              `http://localhost:3000/reviews/${recipeId}`,
              { rating, content },
              { headers: { Authorization: token } }
            );
            return response.data;
          } catch (error: unknown) {
            const axiosError = error as MockAxiosError;
            if (axiosError.isAxiosError && axiosError.response) {
              throw new Error(axiosError.response.data?.error || 'Error adding review');
            }
            throw new Error('Unable to add review');
          }
        }
      );

      await expect(
        reviewService.addReview('recipe1', 5, 'Great recipe!', 'Bearer token123')
      ).rejects.toThrow('Unable to add review');
    });

    it('handles authorization errors (403) correctly', async () => {
      const mockError: MockAxiosError = {
        isAxiosError: true,
        response: {
          status: 403,
          data: { error: 'Unauthorized access' }
        }
      };

      (axios.post as jest.Mock).mockRejectedValueOnce(mockError);

      (reviewService.addReview as jest.Mock).mockImplementationOnce(
        async (recipeId: string, rating: number, content: string, token: string) => {
          try {
            const response = await axios.post(
              `http://localhost:3000/reviews/${recipeId}`,
              { rating, content },
              { headers: { Authorization: token } }
            );
            return response.data;
          } catch (error: unknown) {
            const axiosError = error as MockAxiosError;
            if (axiosError.isAxiosError && axiosError.response) {
              throw new Error(axiosError.response.data?.error || 'Error adding review');
            }
            throw new Error('Unable to add review');
          }
        }
      );

      await expect(
        reviewService.addReview('recipe1', 5, 'Great recipe!', 'Invalid-token')
      ).rejects.toThrow('Unauthorized access');
    });

    it('handles missing token error correctly', async () => {
      const mockError: MockAxiosError = {
        isAxiosError: true,
        response: {
          status: 401,
          data: { error: 'Missing authentication token' }
        }
      };

      (axios.post as jest.Mock).mockRejectedValueOnce(mockError);

      (reviewService.addReview as jest.Mock).mockImplementationOnce(
        async (recipeId: string, rating: number, content: string, token: string) => {
          try {
            const response = await axios.post(
              `http://localhost:3000/reviews/${recipeId}`,
              { rating, content },
              { headers: { Authorization: token } }
            );
            return response.data;
          } catch (error: unknown) {
            const axiosError = error as MockAxiosError;
            if (axiosError.isAxiosError && axiosError.response) {
              throw new Error(axiosError.response.data?.error || 'Error adding review');
            }
            throw new Error('Unable to add review');
          }
        }
      );

      await expect(
        reviewService.addReview('recipe1', 5, 'Great recipe!', '')
      ).rejects.toThrow('Missing authentication token');
    });
  });

  describe('updateReview', () => {
    it('updates a review via API', async () => {
      const updatedReview = {
        _id: 'review1',
        userId: 'user1',
        recipeId: 'recipe1',
        rating: 4,
        content: 'Updated review content',
        createdAt: '2023-01-01T10:00:00Z',
        updatedAt: '2023-04-15T16:45:00Z'
      };

      (axios.put as jest.Mock).mockResolvedValueOnce({ data: updatedReview });

      (reviewService.updateReview as jest.Mock).mockImplementationOnce(
        async (reviewId: string, rating: number, content: string, token: string) => {
          const response = await axios.put(
            `http://localhost:3000/reviews/${reviewId}`,
            { rating, content },
            { headers: { Authorization: token } }
          );
          return response.data;
        }
      );

      const result = await reviewService.updateReview(
        'review1',
        4,
        'Updated review content',
        'Bearer token123'
      );

      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:3000/reviews/review1',
        { rating: 4, content: 'Updated review content' },
        { headers: { Authorization: 'Bearer token123' } }
      );

      expect(result).toEqual(updatedReview);
    });

    it('handles API errors without response data', async () => {
      (axios.put as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      (reviewService.updateReview as jest.Mock).mockImplementationOnce(
        async (reviewId: string, rating: number, content: string, token: string) => {
          try {
            const response = await axios.put(
              `http://localhost:3000/reviews/${reviewId}`,
              { rating, content },
              { headers: { Authorization: token } }
            );
            return response.data;
          } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
              throw new Error(error.response.data?.error || 'Error updating review');
            }
            throw new Error('Unable to update review');
          }
        }
      );

      await expect(
        reviewService.updateReview('review1', 4, 'Updated content', 'Bearer token123')
      ).rejects.toThrow('Unable to update review');
    });
  });
});