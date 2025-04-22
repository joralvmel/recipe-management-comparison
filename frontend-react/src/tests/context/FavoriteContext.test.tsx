import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { FavoriteProvider, useFavoriteContext } from '@context/FavoriteContext';
import { fetchFavorites, addFavorite, removeFavorite } from '@services/favoriteService';
import '@testing-library/jest-dom';

vi.mock('@services/favoriteService', () => ({
  fetchFavorites: vi.fn().mockResolvedValue([]),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
}));

const mockUser = { id: 'user1', email: 'user@example.com', token: 'mock-token' };
vi.mock('@context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isSignedIn: true,
  }),
}));

const mockShowSnackbar = vi.fn();
vi.mock('@context/SnackbarContext', () => ({
  useSnackbar: () => ({
    showSnackbar: mockShowSnackbar,
  }),
}));

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('FavoriteContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetchFavorites as jest.Mock).mockResolvedValue([]);
  });

  it('initializes with empty favorites object', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FavoriteProvider>{children}</FavoriteProvider>
    );

    const { result } = renderHook(() => useFavoriteContext(), { wrapper });

    expect(result.current.favorites).toEqual({});
    expect(typeof result.current.loadFavorites).toBe('function');
    expect(typeof result.current.addToFavorites).toBe('function');
    expect(typeof result.current.removeFromFavorites).toBe('function');
    expect(typeof result.current.isFavorite).toBe('function');

    expect(fetchFavorites).toHaveBeenCalledWith('Bearer mock-token', 'user1');
  });

  it('loads favorites successfully', async () => {
    (fetchFavorites as jest.Mock).mockResolvedValueOnce([
      { id: 'fav1', userId: 'user1', recipeId: 'recipe1' },
      { id: 'fav2', userId: 'user1', recipeId: 'recipe2' },
    ]);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FavoriteProvider>{children}</FavoriteProvider>
    );

    const { result } = renderHook(() => useFavoriteContext(), { wrapper });

    await act(async () => {
    });

    expect(result.current.favorites).toEqual({
      recipe1: true,
      recipe2: true,
    });
  });

  it('handles error when loading favorites', async () => {
    (fetchFavorites as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FavoriteProvider>{children}</FavoriteProvider>
    );

    const { result } = renderHook(() => useFavoriteContext(), { wrapper });

    await act(async () => {
    });

    expect(mockShowSnackbar).toHaveBeenCalledWith('Failed to load favorites', 'error');
    expect(result.current.favorites).toEqual({});
  });

  it('adds a recipe to favorites successfully', async () => {
    (addFavorite as jest.Mock).mockResolvedValueOnce({
      id: 'fav3',
      userId: 'user1',
      recipeId: 'recipe3'
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FavoriteProvider>{children}</FavoriteProvider>
    );

    const { result } = renderHook(() => useFavoriteContext(), { wrapper });

    await act(async () => {
      await result.current.addToFavorites('recipe3');
    });

    expect(addFavorite).toHaveBeenCalledWith('recipe3', 'Bearer mock-token');
    expect(result.current.favorites.recipe3).toBe(true);
    expect(mockShowSnackbar).toHaveBeenCalledWith('Favorite added successfully', 'success');
  });

  it('handles error when adding a favorite', async () => {
    const errorMessage = 'Failed to add favorite';
    (addFavorite as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FavoriteProvider>{children}</FavoriteProvider>
    );

    const { result } = renderHook(() => useFavoriteContext(), { wrapper });

    await act(async () => {
      await result.current.addToFavorites('recipe3');
    });

    expect(mockShowSnackbar).toHaveBeenCalledWith(errorMessage, 'error');
  });

  it('removes a recipe from favorites successfully', async () => {
    (fetchFavorites as jest.Mock).mockResolvedValueOnce([
      { id: 'fav1', userId: 'user1', recipeId: 'recipe1' },
      { id: 'fav2', userId: 'user1', recipeId: 'recipe2' },
    ]);

    (removeFavorite as jest.Mock).mockResolvedValueOnce(true);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FavoriteProvider>{children}</FavoriteProvider>
    );

    const { result } = renderHook(() => useFavoriteContext(), { wrapper });

    await act(async () => {
    });

    await act(async () => {
      await result.current.removeFromFavorites('recipe1');
    });

    expect(removeFavorite).toHaveBeenCalledWith('recipe1', 'Bearer mock-token');
    expect(result.current.favorites.recipe1).toBeUndefined();
    expect(mockShowSnackbar).toHaveBeenCalledWith('Favorite removed successfully', 'success');
  });

  it('handles error when removing a favorite', async () => {
    const errorMessage = 'Failed to remove favorite';
    (removeFavorite as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FavoriteProvider>{children}</FavoriteProvider>
    );

    const { result } = renderHook(() => useFavoriteContext(), { wrapper });

    await act(async () => {
      await result.current.removeFromFavorites('recipe1');
    });

    expect(mockShowSnackbar).toHaveBeenCalledWith(errorMessage, 'error');
  });

  it('checks if a recipe is a favorite', async () => {
    (fetchFavorites as jest.Mock).mockResolvedValueOnce([
      { id: 'fav1', userId: 'user1', recipeId: 'recipe1' },
    ]);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FavoriteProvider>{children}</FavoriteProvider>
    );

    const { result } = renderHook(() => useFavoriteContext(), { wrapper });

    await act(async () => {
    });

    expect(result.current.isFavorite('recipe1')).toBe(true);
    expect(result.current.isFavorite('recipe999')).toBe(false);
  });

  it('throws an error when useFavoriteContext is used outside of FavoriteProvider', () => {
    expect(() => renderHook(() => useFavoriteContext())).toThrow(
      'useFavoriteContext must be used within a FavoriteProvider'
    );
  });
});