import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import useFavorite from '@hooks/useFavorite';
import { useFavoriteContext } from '@context/FavoriteContext';
import { useAuth } from '@context/AuthContext';
import { useSnackbar } from '@context/SnackbarContext';

vi.mock('@context/FavoriteContext', () => ({
  useFavoriteContext: vi.fn()
}));

vi.mock('@context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('@context/SnackbarContext', () => ({
  useSnackbar: vi.fn()
}));

describe('useFavorite', () => {
  const mockIsFavorite = vi.fn();
  const mockAddToFavorites = vi.fn();
  const mockRemoveFromFavorites = vi.fn();
  const mockShowSnackbar = vi.fn();
  const mockIsSignedIn = true;
  const recipeId = '123';

  beforeEach(() => {
    vi.resetAllMocks();

    (useFavoriteContext as jest.Mock).mockReturnValue({
      isFavorite: mockIsFavorite,
      addToFavorites: mockAddToFavorites,
      removeFromFavorites: mockRemoveFromFavorites
    });

    (useAuth as jest.Mock).mockReturnValue({
      isSignedIn: mockIsSignedIn
    });

    (useSnackbar as jest.Mock).mockReturnValue({
      showSnackbar: mockShowSnackbar
    });

    mockIsFavorite.mockImplementation((id) => id !== recipeId);
  });

  it('initializes with correct values', () => {
    const { result } = renderHook(() => useFavorite(recipeId));

    expect(result.current.isSignedIn).toBe(mockIsSignedIn);
    expect(result.current.isFavorite).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockIsFavorite).toHaveBeenCalledWith(recipeId);
  });

  it('adds recipe to favorites if not already a favorite', async () => {
    mockIsFavorite.mockReturnValue(false);
    mockAddToFavorites.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFavorite(recipeId));

    await act(async () => {
      await result.current.handleFavoriteChange();
    });

    expect(mockAddToFavorites).toHaveBeenCalledWith(recipeId);
    expect(mockShowSnackbar).toHaveBeenCalledWith('Recipe added to favorites', 'success');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('removes recipe from favorites if already a favorite', async () => {
    mockIsFavorite.mockReturnValue(true);
    mockRemoveFromFavorites.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFavorite(recipeId));

    await act(async () => {
      await result.current.handleFavoriteChange();
    });

    expect(mockRemoveFromFavorites).toHaveBeenCalledWith(recipeId);
    expect(mockShowSnackbar).toHaveBeenCalledWith('Recipe removed from favorites', 'success');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles errors when adding to favorites fails', async () => {
    const errorMessage = 'Failed to add to favorites';
    mockIsFavorite.mockReturnValue(false);
    mockAddToFavorites.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useFavorite(recipeId));

    await act(async () => {
      await result.current.handleFavoriteChange();
    });

    expect(mockAddToFavorites).toHaveBeenCalledWith(recipeId);
    expect(mockShowSnackbar).toHaveBeenCalledWith(errorMessage, 'error');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('handles errors when removing from favorites fails', async () => {
    const errorMessage = 'Failed to remove from favorites';
    mockIsFavorite.mockReturnValue(true);
    mockRemoveFromFavorites.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useFavorite(recipeId));

    await act(async () => {
      await result.current.handleFavoriteChange();
    });

    expect(mockRemoveFromFavorites).toHaveBeenCalledWith(recipeId);
    expect(mockShowSnackbar).toHaveBeenCalledWith(errorMessage, 'error');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('handles unknown errors with generic message', async () => {
    mockIsFavorite.mockReturnValue(false);
    mockAddToFavorites.mockRejectedValue('Unknown error');

    const { result } = renderHook(() => useFavorite(recipeId));

    await act(async () => {
      await result.current.handleFavoriteChange();
    });

    expect(mockAddToFavorites).toHaveBeenCalledWith(recipeId);
    expect(mockShowSnackbar).toHaveBeenCalledWith('An error occurred', 'error');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('An error occurred');
  });

  it('prevents multiple simultaneous calls', async () => {
    let callCount = 0;
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    mockAddToFavorites.mockImplementation(() => {
      callCount++;
      return promise;
    });

    mockIsFavorite.mockReturnValue(false);

    const { result } = renderHook(() => useFavorite(recipeId));

    act(() => {
      result.current.handleFavoriteChange();
    });

    act(() => {
      result.current.handleFavoriteChange();
    });

    await act(async () => {
      resolvePromise(undefined);
    });

    expect(callCount).toBe(1);
  });

  it('updates correctly when favorite status changes', () => {
    mockIsFavorite.mockReturnValueOnce(false).mockReturnValueOnce(true);

    const { result, rerender } = renderHook(({ id }) => useFavorite(id), {
      initialProps: { id: recipeId }
    });

    expect(result.current.isFavorite).toBe(false);

    rerender({ id: recipeId });

    expect(result.current.isFavorite).toBe(true);
  });
});