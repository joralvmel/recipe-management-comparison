import type { RecipeType } from '@src/types';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import useFavoritesSearch from '@hooks/useFavoritesSearch';
import { useFavoritesSearchContext } from '@context/FavoriteSearchContext';
import { useAuth } from '@context/AuthContext';
import { fetchFavoritesWithDetails, filterFavoriteRecipes } from '@services/favoriteService';

vi.mock('@context/FavoriteSearchContext', () => ({
  useFavoritesSearchContext: vi.fn()
}));

vi.mock('@context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('@services/favoriteService', () => ({
  fetchFavoritesWithDetails: vi.fn(),
  filterFavoriteRecipes: vi.fn()
}));

describe('useFavoritesSearch', () => {
  const mockRecipes: RecipeType[] = [
    {
      id: 1,
      title: 'Pasta Carbonara',
      image: 'carbonara.jpg',
      cuisines: ['Italian'],
      dishTypes: ['main course'],
      diets: [],
      readyInMinutes: 30,
      healthScore: 40,
      extendedIngredients: [],
      analyzedInstructions: []
    },
    {
      id: 2,
      title: 'Chicken Curry',
      image: 'curry.jpg',
      cuisines: ['Indian'],
      dishTypes: ['main course'],
      diets: [],
      readyInMinutes: 45,
      healthScore: 60,
      extendedIngredients: [],
      analyzedInstructions: []
    },
    {
      id: 3,
      title: 'Greek Salad',
      image: 'salad.jpg',
      cuisines: ['Greek'],
      dishTypes: ['salad'],
      diets: ['vegetarian'],
      readyInMinutes: 15,
      healthScore: 85,
      extendedIngredients: [],
      analyzedInstructions: []
    }
  ];

  const mockSetSearchQuery = vi.fn();
  const mockSetTotalResults = vi.fn();
  const mockSetPageNumber = vi.fn();
  const mockSetResultsPerPage = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    (useFavoritesSearchContext as jest.Mock).mockReturnValue({
      searchQuery: '',
      setSearchQuery: mockSetSearchQuery,
      pageNumber: 1,
      resultsPerPage: 10,
      setTotalResults: mockSetTotalResults,
      setPageNumber: mockSetPageNumber,
      setResultsPerPage: mockSetResultsPerPage
    });

    (useAuth as jest.Mock).mockReturnValue({
      isSignedIn: true,
      user: { id: 'user123', token: 'token123' }
    });

    (fetchFavoritesWithDetails as jest.Mock).mockResolvedValue(mockRecipes);
    (filterFavoriteRecipes as jest.Mock).mockImplementation((recipes, query) => {
      if (!query) return recipes;
      return recipes.filter((r: RecipeType) =>
        r.title?.toLowerCase().includes(query.toLowerCase()) || false
      );
    });

    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('initializes with correct values', async () => {
    const { result } = renderHook(() => useFavoritesSearch());

    expect(mockSetPageNumber).toHaveBeenCalledWith(1);
    expect(mockSetResultsPerPage).toHaveBeenCalledWith(10);

    expect(result.current.favoritesSearchQuery).toBe('');
    expect(result.current.loading).toBe(true);

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(fetchFavoritesWithDetails).toHaveBeenCalledWith('Bearer token123', 'user123');
    expect(filterFavoriteRecipes).toHaveBeenCalledWith(mockRecipes, '');
    expect(mockSetTotalResults).toHaveBeenCalledWith(3);
    expect(result.current.paginatedFavorites).toEqual(mockRecipes);
  });

  it('fetches favorites when user is signed in', async () => {
    renderHook(() => useFavoritesSearch());

    await vi.waitFor(() => {
      expect(fetchFavoritesWithDetails).toHaveBeenCalledWith('Bearer token123', 'user123');
    });
  });

  it('does not fetch favorites when user is not signed in', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isSignedIn: false,
      user: null
    });

    renderHook(() => useFavoritesSearch());

    expect(fetchFavoritesWithDetails).not.toHaveBeenCalled();
  });

  it('filters recipes based on search query', async () => {
    (useFavoritesSearchContext as jest.Mock).mockReturnValue({
      searchQuery: 'pasta',
      setSearchQuery: mockSetSearchQuery,
      pageNumber: 1,
      resultsPerPage: 10,
      setTotalResults: mockSetTotalResults,
      setPageNumber: mockSetPageNumber,
      setResultsPerPage: mockSetResultsPerPage
    });

    const { result } = renderHook(() => useFavoritesSearch());

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(filterFavoriteRecipes).toHaveBeenCalledWith(mockRecipes, 'pasta');
    expect(mockSetTotalResults).toHaveBeenCalledWith(1);
  });

  it('handles pagination correctly', async () => {
    (useFavoritesSearchContext as jest.Mock).mockReturnValue({
      searchQuery: '',
      setSearchQuery: mockSetSearchQuery,
      pageNumber: 2,
      resultsPerPage: 1,
      setTotalResults: mockSetTotalResults,
      setPageNumber: mockSetPageNumber,
      setResultsPerPage: mockSetResultsPerPage
    });

    const { result } = renderHook(() => useFavoritesSearch());

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.paginatedFavorites).toEqual([mockRecipes[1]]);
    expect(mockSetTotalResults).toHaveBeenCalledWith(3);
  });

  it('handles errors when fetching favorites', async () => {
    (fetchFavoritesWithDetails as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    const { result } = renderHook(() => useFavoritesSearch());

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(console.error).toHaveBeenCalledWith('Error loading favorite recipes:', expect.any(Error));
    expect(result.current.paginatedFavorites).toEqual([]);
  });

  it('updates when search context changes', async () => {
    const { result, rerender } = renderHook(() => useFavoritesSearch());

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    (useFavoritesSearchContext as jest.Mock).mockReturnValue({
      searchQuery: 'chicken',
      setSearchQuery: mockSetSearchQuery,
      pageNumber: 1,
      resultsPerPage: 10,
      setTotalResults: mockSetTotalResults,
      setPageNumber: mockSetPageNumber,
      setResultsPerPage: mockSetResultsPerPage
    });

    rerender();

    expect(result.current.favoritesSearchQuery).toBe('chicken');
    expect(filterFavoriteRecipes).toHaveBeenCalledWith(mockRecipes, 'chicken');
  });

  it('sets total results when favorite cards change', async () => {
    const { result, rerender } = renderHook(() => useFavoritesSearch());

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockSetTotalResults).toHaveBeenCalledWith(3);

    (filterFavoriteRecipes as jest.Mock).mockReturnValue([mockRecipes[0]]);
    (useFavoritesSearchContext as jest.Mock).mockReturnValue({
      searchQuery: 'pasta',
      setSearchQuery: mockSetSearchQuery,
      pageNumber: 1,
      resultsPerPage: 10,
      setTotalResults: mockSetTotalResults,
      setPageNumber: mockSetPageNumber,
      setResultsPerPage: mockSetResultsPerPage
    });

    rerender();

    expect(mockSetTotalResults).toHaveBeenCalledWith(1);
  });

  it('handles empty search results', async () => {
    (filterFavoriteRecipes as jest.Mock).mockReturnValue([]);

    const { result } = renderHook(() => useFavoritesSearch());

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.paginatedFavorites).toEqual([]);
    expect(mockSetTotalResults).toHaveBeenCalledWith(0);
  });
});