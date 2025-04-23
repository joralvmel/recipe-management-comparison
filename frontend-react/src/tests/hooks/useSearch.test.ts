import type { RenderHookResult } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import useSearch from '@hooks/useSearch';
import { useRecipesQuery } from '@hooks/useRecipesQuery';
import { useRecipeSearch } from '@context/RecipeSearchContext';
import { useSnackbar } from '@context/SnackbarContext';
import { filters } from '@data/filterData';

vi.mock('@hooks/useRecipesQuery', () => ({
  useRecipesQuery: vi.fn(),
}));

vi.mock('@context/RecipeSearchContext', () => ({
  useRecipeSearch: vi.fn(),
}));

vi.mock('@context/SnackbarContext', () => ({
  useSnackbar: vi.fn(),
}));

vi.mock('@data/filterData', () => ({
  filters: [
    { id: 'cuisine', name: 'Cuisine', options: [{ value: 'italian', label: 'Italian' }] },
    { id: 'diet', name: 'Diet', options: [{ value: 'vegetarian', label: 'Vegetarian' }] },
  ],
}));

describe('useSearch', () => {
  const mockSetSearchQuery = vi.fn();
  const mockSetFilter = vi.fn();
  const mockSetTotalResults = vi.fn();
  const mockResetSearch = vi.fn();
  const mockResetPagination = vi.fn();
  const mockShowSnackbar = vi.fn();

  const initialGlobalFilters = { cuisine: 'italian' };
  const initialSearchQuery = 'pasta';
  const initialPageNumber = 1;
  const initialResultsPerPage = 10;

  const mockRecipes = [
    { id: 1, title: 'Spaghetti Carbonara' },
    { id: 2, title: 'Pasta Primavera' },
  ];

  beforeEach(() => {
    vi.resetAllMocks();

    (useRecipeSearch as Mock).mockReturnValue({
      searchQuery: initialSearchQuery,
      setSearchQuery: mockSetSearchQuery,
      filters: initialGlobalFilters,
      setFilter: mockSetFilter,
      setTotalResults: mockSetTotalResults,
      pageNumber: initialPageNumber,
      resultsPerPage: initialResultsPerPage,
      resetSearch: mockResetSearch,
      resetPagination: mockResetPagination,
    });

    (useSnackbar as Mock).mockReturnValue({
      showSnackbar: mockShowSnackbar,
    });

    (useRecipesQuery as Mock).mockReturnValue({
      data: {
        results: mockRecipes,
        totalResults: 50,
      },
      isLoading: false,
      error: null,
    });
  });

  it('initializes with values from RecipeSearchContext', () => {
    const { result } = renderHook(() => useSearch());

    expect(result.current.typedQuery).toBe(initialSearchQuery);
    expect(result.current.typedFilters).toEqual(initialGlobalFilters);
    expect(result.current.paginatedCards).toEqual(mockRecipes);
    expect(result.current.filterOptions).toEqual(filters);
    expect(result.current.loading).toBe(false);
  });

  it('updates typedQuery when setTypedQuery is called', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setTypedQuery('risotto');
    });

    expect(result.current.typedQuery).toBe('risotto');
    expect(mockSetSearchQuery).not.toHaveBeenCalled();
  });

  it('updates typedFilters when setTypedFilters is called', () => {
    const { result } = renderHook(() => useSearch());

    const newFilters = { cuisine: 'italian', diet: 'vegetarian' };

    act(() => {
      result.current.setTypedFilters(newFilters);
    });

    expect(result.current.typedFilters).toEqual(newFilters);
    expect(mockSetFilter).not.toHaveBeenCalled();
  });

  it('calls appropriate functions when handleSearch is called', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setTypedQuery('risotto');
      result.current.setTypedFilters({ cuisine: 'italian', diet: 'vegetarian' });
    });

    act(() => {
      result.current.handleSearch();
    });

    expect(mockResetPagination).toHaveBeenCalled();

    expect(mockSetSearchQuery).toHaveBeenCalledWith('risotto');

    expect(mockSetFilter).toHaveBeenCalledWith('cuisine', 'italian');
    expect(mockSetFilter).toHaveBeenCalledWith('diet', 'vegetarian');
  });

  it('calls appropriate functions when handleReset is called', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setTypedQuery('risotto');
      result.current.setTypedFilters({ cuisine: 'french' });
    });

    act(() => {
      result.current.handleReset();
    });

    expect(mockResetSearch).toHaveBeenCalled();

    expect(result.current.typedQuery).toBe('');
    expect(result.current.typedFilters).toEqual({});

    expect(mockShowSnackbar).toHaveBeenCalledWith('Filters reset', 'info');
  });

  it('updates totalResults when data changes', async () => {
    let hook: RenderHookResult<ReturnType<typeof useSearch>, unknown> | undefined;

    await act(async () => {
      hook = renderHook(() => useSearch());
    });

    expect(mockSetTotalResults).toHaveBeenCalledWith(50);

    (useRecipesQuery as Mock).mockReturnValue({
      data: {
        results: [...mockRecipes, { id: 3, title: 'New Recipe' }],
        totalResults: 75,
      },
      isLoading: false,
      error: null,
    });

    await act(async () => {
      if (!hook) {
        throw new Error('Hook was not initialized');
      }
      hook.rerender();
    });

    expect(mockSetTotalResults).toHaveBeenCalledWith(75);
  });

  it('shows error notification when query has error', () => {
    (useRecipesQuery as Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch'),
    });

    renderHook(() => useSearch());

    expect(mockShowSnackbar).toHaveBeenCalledWith('Error fetching recipes', 'error');
  });

  it('returns loading state from useRecipesQuery', () => {
    (useRecipesQuery as Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    const { result } = renderHook(() => useSearch());

    expect(result.current.loading).toBe(true);
  });

  it('returns empty array when data is null', () => {
    (useRecipesQuery as Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useSearch());

    expect(result.current.paginatedCards).toEqual([]);
  });

  it('properly formats the query parameters for useRecipesQuery', () => {
    renderHook(() => useSearch());

    expect(useRecipesQuery).toHaveBeenCalledWith(
      initialGlobalFilters,
      initialSearchQuery,
      initialPageNumber,
      initialResultsPerPage
    );
  });
});