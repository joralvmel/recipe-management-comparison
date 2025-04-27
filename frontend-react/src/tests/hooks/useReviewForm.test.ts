import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import useReviewForm from '@hooks/useReviewForm';

describe('useReviewForm', () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>;
  let mockEvent: {
    preventDefault: () => void;
  };
  let mockTextAreaEvent: {
    target: {
      value: string;
    };
  };

  beforeEach(() => {
    mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    mockEvent = {
      preventDefault: vi.fn(),
    };
    mockTextAreaEvent = {
      target: {
        value: 'Test comment',
      },
    };
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useReviewForm({ onSubmit: mockOnSubmit }));

    expect(result.current.rating).toBe(0);
    expect(result.current.comment).toBe('');
    expect(result.current.error).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  it('updates rating when handleRatingChange is called', () => {
    const { result } = renderHook(() => useReviewForm({ onSubmit: mockOnSubmit }));

    act(() => {
      result.current.handleRatingChange(4);
    });

    expect(result.current.rating).toBe(4);
  });

  it('updates comment when handleCommentChange is called', () => {
    const { result } = renderHook(() => useReviewForm({ onSubmit: mockOnSubmit }));

    act(() => {
      result.current.handleCommentChange(mockTextAreaEvent as React.ChangeEvent<HTMLTextAreaElement>);
    });

    expect(result.current.comment).toBe('Test comment');
  });

  it('calls onSubmit with correct values when form is submitted', async () => {
    const { result } = renderHook(() => useReviewForm({ onSubmit: mockOnSubmit }));

    act(() => {
      result.current.handleRatingChange(5);
      result.current.handleCommentChange({ target: { value: 'Great product!' } } as React.ChangeEvent<HTMLTextAreaElement>);
    });

    await act(async () => {
      await result.current.handleSubmit(mockEvent as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockOnSubmit).toHaveBeenCalledWith(5, 'Great product!');
  });

  it('sets loading state during form submission', async () => {
    let resolveSubmit: () => void;
    const submissionPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });

    const delayedMockSubmit = vi.fn().mockReturnValue(submissionPromise);

    const { result } = renderHook(() => useReviewForm({ onSubmit: delayedMockSubmit }));

    let submissionPromiseComplete = false;
    act(() => {
      result.current.handleSubmit(mockEvent as unknown as React.FormEvent<HTMLFormElement>)
        .then(() => { submissionPromiseComplete = true; });
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      if (resolveSubmit) {
        resolveSubmit();
      }
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(submissionPromiseComplete).toBe(true);
  });

  it('resets form after successful submission', async () => {
    const { result } = renderHook(() => useReviewForm({ onSubmit: mockOnSubmit }));

    act(() => {
      result.current.handleRatingChange(4);
      result.current.handleCommentChange({ target: { value: 'Good stuff' } } as React.ChangeEvent<HTMLTextAreaElement>);
    });

    await act(async () => {
      await result.current.handleSubmit(mockEvent as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.rating).toBe(0);
    expect(result.current.comment).toBe('');
    expect(result.current.error).toBe(null);
  });

  it('sets error state when submission fails', async () => {
    const mockError = new Error('Submission failed');
    const mockErrorSubmit = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useReviewForm({ onSubmit: mockErrorSubmit }));

    await act(async () => {
      await result.current.handleSubmit(mockEvent as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.error).toBe('Submission failed');
    expect(result.current.loading).toBe(false);
  });

  it('handles non-Error rejection with generic message', async () => {
    const mockErrorSubmit = vi.fn().mockRejectedValue('Some string error');

    const { result } = renderHook(() => useReviewForm({ onSubmit: mockErrorSubmit }));

    await act(async () => {
      await result.current.handleSubmit(mockEvent as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.error).toBe('Unexpected error occurred');
  });

  it('preserves callback references between renders', async () => {
    const { result, rerender } = renderHook(() => useReviewForm({ onSubmit: mockOnSubmit }));

    const initialHandleRatingChange = result.current.handleRatingChange;
    const initialHandleCommentChange = result.current.handleCommentChange;
    const initialHandleSubmit = result.current.handleSubmit;

    rerender({ onSubmit: mockOnSubmit });

    expect(result.current.handleRatingChange).toBe(initialHandleRatingChange);
    expect(result.current.handleCommentChange).toBe(initialHandleCommentChange);
    expect(result.current.handleSubmit).toBe(initialHandleSubmit);
  });

  it('recreates submit callback when onSubmit prop changes', () => {
    const { result, rerender } = renderHook(
      (props) => useReviewForm(props),
      { initialProps: { onSubmit: mockOnSubmit } }
    );

    const initialHandleSubmit = result.current.handleSubmit;

    const newMockOnSubmit = vi.fn().mockResolvedValue(undefined);

    rerender({ onSubmit: newMockOnSubmit });

    expect(result.current.handleSubmit).not.toBe(initialHandleSubmit);
  });
});