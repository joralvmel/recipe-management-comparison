import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { fetchRecipes } from '@services/recipeService';
import { useRecipesQuery } from '@hooks/useRecipesQuery';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

vi.mock('@services/recipeService', () => ({
  fetchRecipes: vi.fn(),
}));

describe('useRecipesQuery', () => {
  const mockQueryResult = {
    data: {
      results: [{ id: 1, title: 'Recipe 1' }],
      totalResults: 100,
    },
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (useQuery as Mock).mockReturnValue(mockQueryResult);
  });

  it('should call useQuery with correct parameters', () => {
    const filters = { cuisine: 'Italian', diet: 'vegetarian' };
    const searchQuery = 'pasta';
    const pageNumber = 2;
    const resultsPerPage = 10;

    renderHook(() => useRecipesQuery(filters, searchQuery, pageNumber, resultsPerPage));

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['recipes', filters, searchQuery, pageNumber, resultsPerPage],
      queryFn: expect.any(Function),
      staleTime: 5 * 60 * 1000,
    });
  });

  it('should calculate correct offset in queryFn', () => {
    const filters = { cuisine: 'Italian' };
    const searchQuery = 'pasta';
    const pageNumber = 3;
    const resultsPerPage = 20;

    renderHook(() => useRecipesQuery(filters, searchQuery, pageNumber, resultsPerPage));

    const queryFn = (useQuery as Mock).mock.calls[0][0].queryFn;
    queryFn();

    expect(fetchRecipes).toHaveBeenCalledWith(filters, searchQuery, resultsPerPage, (pageNumber - 1) * resultsPerPage);
    expect(fetchRecipes).toHaveBeenCalledWith(filters, searchQuery, 20, 40);
  });

  it('should handle pagination correctly', () => {
    const testCases = [
      { page: 1, perPage: 10, expectedOffset: 0 },
      { page: 2, perPage: 10, expectedOffset: 10 },
      { page: 3, perPage: 15, expectedOffset: 30 },
    ];

    for (const { page, perPage, expectedOffset } of testCases) {
      (useQuery as Mock).mockClear();
      (fetchRecipes as Mock).mockClear();

      renderHook(() => useRecipesQuery({}, '', page, perPage));

      const queryFn = (useQuery as Mock).mock.calls[0][0].queryFn;
      queryFn();

      expect(fetchRecipes).toHaveBeenCalledWith({}, '', perPage, expectedOffset);
    }
  });

  it('should return the result from useQuery', () => {
    const { result } = renderHook(() => useRecipesQuery({}, '', 1, 10));

    expect(result.current).toBe(mockQueryResult);
  });

  it('should use new query key when parameters change', () => {
    const { rerender } = renderHook(
      (props) => useRecipesQuery(props.filters, props.query, props.page, props.perPage),
      {
        initialProps: {
          filters: { cuisine: 'Italian' },
          query: 'pasta',
          page: 1,
          perPage: 10,
        },
      }
    );

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['recipes', { cuisine: 'Italian' }, 'pasta', 1, 10],
      })
    );

    rerender({
      filters: { cuisine: 'Mexican' },
      query: 'taco',
      page: 2,
      perPage: 20,
    });

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['recipes', { cuisine: 'Mexican' }, 'taco', 2, 20],
      })
    );
  });
});