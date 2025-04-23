import type { ReviewType } from '@src/types';
import type { RenderHookResult } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { useReviews } from '@hooks/useReviews';
import { fetchReviews, addReview, updateReview } from '@services/reviewService';
import { useSnackbar } from '@context/SnackbarContext';

vi.mock('@services/reviewService', () => ({
  fetchReviews: vi.fn(),
  addReview: vi.fn(),
  updateReview: vi.fn(),
}));

vi.mock('@context/SnackbarContext', () => ({
  useSnackbar: vi.fn(),
}));

describe('useReviews', () => {
  const mockShowSnackbar = vi.fn();
  const recipeId = 'recipe-123';

  const mockReviews: ReviewType[] = [
    {
      _id: 'review-1',
      userId: 'user-1',
      recipeId: 'recipe-123',
      rating: 4,
      content: 'Great recipe!',
      createdAt: '2025-04-23T12:35:43Z'
    },
    {
      _id: 'review-2',
      userId: 'user-2',
      recipeId: 'recipe-123',
      rating: 5,
      content: 'Amazing!',
      createdAt: '2025-04-23T12:30:00Z'
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    (useSnackbar as Mock).mockReturnValue({ showSnackbar: mockShowSnackbar });
    (fetchReviews as Mock).mockResolvedValue(mockReviews);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('initializes with correct default values and starts loading', async () => {
    let hook: RenderHookResult<ReturnType<typeof useReviews>, unknown> | undefined;

    const fetchPromise = new Promise<ReviewType[]>(resolve => setTimeout(() => resolve(mockReviews), 100));
    (fetchReviews as Mock).mockReturnValue(fetchPromise);

    await act(async () => {
      hook = renderHook(() => useReviews(recipeId));
    });

    if (!hook) {
      throw new Error('Hook was not initialized');
    }

    const { result } = hook;

    expect(result.current.reviews).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    await act(async () => {
      await fetchPromise;
    });
  });

  it('fetches reviews on mount', async () => {
    let hook: RenderHookResult<ReturnType<typeof useReviews>, unknown> | undefined;

    await act(async () => {
      hook = renderHook(() => useReviews(recipeId));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    if (!hook) {
      throw new Error('Hook was not initialized');
    }

    const { result } = hook;

    expect(fetchReviews).toHaveBeenCalledWith(recipeId);
    expect(result.current.reviews).toEqual(mockReviews);
    expect(result.current.loading).toBe(false);
  });

  it('handles error when fetching reviews fails', async () => {
    const error = new Error('Failed to fetch reviews');
    (fetchReviews as Mock).mockRejectedValue(error);

    let hook: RenderHookResult<ReturnType<typeof useReviews>, unknown> | undefined;

    await act(async () => {
      hook = renderHook(() => useReviews(recipeId));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    if (!hook) {
      throw new Error('Hook was not initialized');
    }

    const { result } = hook;

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to fetch reviews');
    expect(mockShowSnackbar).toHaveBeenCalledWith('Failed to fetch reviews', 'error');
  });

  it('refetches reviews when recipeId changes', async () => {
    let hook: RenderHookResult<ReturnType<typeof useReviews>, string> | undefined;

    await act(async () => {
      hook = renderHook((id) => useReviews(id), { initialProps: recipeId });
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    if (!hook) {
      throw new Error('Hook was not initialized');
    }

    expect(fetchReviews).toHaveBeenCalledWith(recipeId);
    (fetchReviews as Mock).mockClear();

    const newRecipeId = 'recipe-456';

    await act(async () => {
      if (!hook) {
        throw new Error('Hook was not initialized');
      }

      hook.rerender(newRecipeId);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(fetchReviews).toHaveBeenCalledWith(newRecipeId);
  });

  it('adds a new review successfully', async () => {
    const newReview: ReviewType = {
      _id: 'new-review',
      userId: 'user-3',
      recipeId: 'recipe-123',
      rating: 3,
      content: 'Good recipe',
      createdAt: '2025-04-23T12:40:00Z'
    };

    (addReview as Mock).mockResolvedValue(newReview);

    let hook: RenderHookResult<ReturnType<typeof useReviews>, unknown> | undefined;

    await act(async () => {
      hook = renderHook(() => useReviews(recipeId));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    if (!hook) {
      throw new Error('Hook was not initialized');
    }

    const { result } = hook;

    await act(async () => {
      await result.current.addNewReview(3, 'Good recipe', 'token-123');
    });

    expect(addReview).toHaveBeenCalledWith(recipeId, 3, 'Good recipe', 'token-123');
    expect(result.current.reviews).toEqual([...mockReviews, newReview]);
    expect(mockShowSnackbar).toHaveBeenCalledWith('Review added successfully', 'success');
  });

  it('handles error when adding a review fails', async () => {
    const error = new Error('Failed to add review');
    (addReview as Mock).mockRejectedValue(error);

    let hook: RenderHookResult<ReturnType<typeof useReviews>, unknown> | undefined;

    await act(async () => {
      hook = renderHook(() => useReviews(recipeId));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    if (!hook) {
      throw new Error('Hook was not initialized');
    }

    const { result } = hook;

    await act(async () => {
      await result.current.addNewReview(3, 'Good recipe', 'token-123');
    });

    expect(result.current.error).toBe('Failed to add review');
    expect(mockShowSnackbar).toHaveBeenCalledWith('Failed to add review', 'error');
    expect(result.current.reviews).toEqual(mockReviews); // Reviews should remain unchanged
  });

  it('updates an existing review successfully', async () => {
    const updatedReview: ReviewType = {
      ...mockReviews[0],
      rating: 5,
      content: 'Updated content'
    };

    (updateReview as Mock).mockResolvedValue(updatedReview);

    let hook: RenderHookResult<ReturnType<typeof useReviews>, unknown> | undefined;

    await act(async () => {
      hook = renderHook(() => useReviews(recipeId));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    if (!hook) {
      throw new Error('Hook was not initialized');
    }

    const { result } = hook;

    await act(async () => {
      await result.current.updateExistingReview('review-1', 5, 'Updated content', 'token-123');
    });

    expect(updateReview).toHaveBeenCalledWith('review-1', 5, 'Updated content', 'token-123');

    const expectedReviews = [
      updatedReview,
      mockReviews[1]
    ];

    expect(result.current.reviews).toEqual(expectedReviews);
    expect(mockShowSnackbar).toHaveBeenCalledWith('Review updated successfully', 'success');
  });

  it('handles error when updating a review fails', async () => {
    const error = new Error('Failed to update review');
    (updateReview as Mock).mockRejectedValue(error);

    let hook: RenderHookResult<ReturnType<typeof useReviews>, unknown> | undefined;

    await act(async () => {
      hook = renderHook(() => useReviews(recipeId));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    if (!hook) {
      throw new Error('Hook was not initialized');
    }

    const { result } = hook;

    await act(async () => {
      await result.current.updateExistingReview('review-1', 5, 'Updated content', 'token-123');
    });

    expect(result.current.error).toBe('Failed to update review');
    expect(mockShowSnackbar).toHaveBeenCalledWith('Failed to update review', 'error');
    expect(result.current.reviews).toEqual(mockReviews); // Reviews should remain unchanged
  });

  it('handles non-Error rejection with generic message', async () => {
    (fetchReviews as Mock).mockRejectedValue('String error');

    let hook: RenderHookResult<ReturnType<typeof useReviews>, unknown> | undefined;

    await act(async () => {
      hook = renderHook(() => useReviews(recipeId));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    if (!hook) {
      throw new Error('Hook was not initialized');
    }

    const { result } = hook;

    expect(result.current.error).toBe('Failed to load reviews');
    expect(mockShowSnackbar).toHaveBeenCalledWith('Failed to load reviews', 'error');
  });
});