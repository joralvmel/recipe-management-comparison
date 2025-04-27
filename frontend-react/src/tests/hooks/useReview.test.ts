import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import useReview from '@hooks/useReview';
import { fetchUserById } from '@services/authService';
import type { RenderHookResult } from '@testing-library/react';

vi.mock('@services/authService', () => ({
  fetchUserById: vi.fn(),
}));

interface UseReviewReturn {
  isEditing: boolean;
  editedComment: string;
  editedRating: number;
  setEditedComment: (comment: string) => void;
  setEditedRating: (rating: number) => void;
  handleEditClick: () => void;
  handleCancelClick: () => void;
  handleSaveClick: () => void;
  userName: string;
}

describe('useReview', () => {
  const defaultProps = {
    id: 'review-123',
    userId: 'user-456',
    comment: 'Initial comment',
    rating: 4,
    onSave: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (fetchUserById as Mock).mockResolvedValue({ name: 'Test User' });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with correct values', async () => {
    let hook: RenderHookResult<UseReviewReturn, typeof defaultProps> | undefined;
    await act(async () => {
      hook = renderHook(() => useReview(defaultProps));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    if (!hook) {
      throw new Error('Hook was not initialized');
    }

    const { result } = hook;

    expect(result.current.isEditing).toBe(false);
    expect(result.current.editedComment).toBe('Initial comment');
    expect(result.current.editedRating).toBe(4);
    expect(result.current.userName).toBe('Test User');
  });

  it('fetches and sets user name on mount', async () => {
    let hook: RenderHookResult<UseReviewReturn, typeof defaultProps> | undefined;
    await act(async () => {
      hook = renderHook(() => useReview(defaultProps));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    if (!hook) {
      throw new Error('Hook was not initialized');
    }

    const { result } = hook;
    expect(fetchUserById).toHaveBeenCalledWith('user-456');
    expect(result.current.userName).toBe('Test User');
  });

  it('handles error when fetching user name fails', async () => {
    (fetchUserById as Mock).mockRejectedValue(new Error('Failed to fetch'));

    let hook: RenderHookResult<UseReviewReturn, typeof defaultProps> | undefined;
    await act(async () => {
      hook = renderHook(() => useReview(defaultProps));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    if (!hook) {
      throw new Error('Hook was not initialized');
    }

    const { result } = hook;
    expect(result.current.userName).toBe('Unknown');
  });

  it('enters edit mode when handleEditClick is called', async () => {
    let hook: RenderHookResult<UseReviewReturn, typeof defaultProps> | undefined;
    await act(async () => {
      hook = renderHook(() => useReview(defaultProps));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    if (!hook) {
      throw new Error('Hook was not initialized');
    }

    const { result } = hook;

    act(() => {
      result.current.handleEditClick();
    });

    expect(result.current.isEditing).toBe(true);
  });

  it('updates edited comment', async () => {
    let hook: RenderHookResult<UseReviewReturn, typeof defaultProps> | undefined;
    await act(async () => {
      hook = renderHook(() => useReview(defaultProps));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    if (!hook) {
      throw new Error('Hook was not initialized');
    }

    const { result } = hook;

    act(() => {
      result.current.setEditedComment('Updated comment');
    });

    expect(result.current.editedComment).toBe('Updated comment');
  });

  it('updates edited rating', async () => {
    let hook: RenderHookResult<UseReviewReturn, typeof defaultProps> | undefined;
    await act(async () => {
      hook = renderHook(() => useReview(defaultProps));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    if (!hook) {
      throw new Error('Hook was not initialized');
    }

    const { result } = hook;

    act(() => {
      result.current.setEditedRating(5);
    });

    expect(result.current.editedRating).toBe(5);
  });

  it('resets to original values when cancel is clicked', async () => {
    let hook: RenderHookResult<UseReviewReturn, typeof defaultProps> | undefined;
    await act(async () => {
      hook = renderHook(() => useReview(defaultProps));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    if (!hook) {
      throw new Error('Hook was not initialized');
    }

    const { result } = hook;

    act(() => {
      result.current.handleEditClick();
      result.current.setEditedComment('Updated comment');
      result.current.setEditedRating(5);
    });

    act(() => {
      result.current.handleCancelClick();
    });

    expect(result.current.isEditing).toBe(false);
    expect(result.current.editedComment).toBe('Initial comment');
    expect(result.current.editedRating).toBe(4);
  });

  it('calls onSave with updated values when save is clicked', async () => {
    let hook: RenderHookResult<UseReviewReturn, typeof defaultProps> | undefined;
    await act(async () => {
      hook = renderHook(() => useReview(defaultProps));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    if (!hook) {
      throw new Error('Hook was not initialized');
    }

    const { result } = hook;

    act(() => {
      result.current.handleEditClick();
      result.current.setEditedComment('Updated comment');
      result.current.setEditedRating(5);
    });

    act(() => {
      result.current.handleSaveClick();
    });

    expect(defaultProps.onSave).toHaveBeenCalledWith(
      'review-123',
      5,
      'Updated comment'
    );
    expect(result.current.isEditing).toBe(false);
  });

  it('updates internal state when props change', async () => {
    const initialProps = defaultProps;

    let hook: RenderHookResult<UseReviewReturn, typeof defaultProps> | undefined;
    await act(async () => {
      hook = renderHook((props) => useReview(props), {
        initialProps,
      });
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    if (!hook) {
      throw new Error('Hook was not initialized');
    }

    const { result, rerender } = hook;

    const updatedProps = {
      ...defaultProps,
      comment: 'New comment from props',
      rating: 2,
    };

    await act(async () => {
      rerender(updatedProps);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.handleEditClick();
    });

    act(() => {
      result.current.handleCancelClick();
    });

    expect(result.current.editedComment).toBe('New comment from props');
    expect(result.current.editedRating).toBe(2);
  });

  it('fetches user again if userId changes', async () => {
    let hook: RenderHookResult<UseReviewReturn, typeof defaultProps> | undefined;
    await act(async () => {
      hook = renderHook((props) => useReview(props), {
        initialProps: defaultProps,
      });
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    if (!hook) {
      throw new Error('Hook was not initialized');
    }

    const { rerender } = hook;

    expect(fetchUserById).toHaveBeenCalledTimes(1);
    expect(fetchUserById).toHaveBeenCalledWith('user-456');

    (fetchUserById as Mock).mockClear();
    (fetchUserById as Mock).mockResolvedValue({ name: 'Another User' });

    await act(async () => {
      rerender({
        ...defaultProps,
        userId: 'user-789',
      });
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(fetchUserById).toHaveBeenCalledTimes(1);
    expect(fetchUserById).toHaveBeenCalledWith('user-789');
  });
});