import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { RecipeSearchProvider, useRecipeSearch } from '@context/RecipeSearchContext';
import '@testing-library/jest-dom';

describe('RecipeSearchContext', () => {
  it('initializes with default values', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecipeSearchProvider>{children}</RecipeSearchProvider>
    );

    const { result } = renderHook(() => useRecipeSearch(), { wrapper });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.filters).toEqual({});
    expect(result.current.pageNumber).toBe(1);
    expect(result.current.resultsPerPage).toBe(10);
    expect(result.current.totalResults).toBe(0);
  });

  it('updates searchQuery when setSearchQuery is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecipeSearchProvider>{children}</RecipeSearchProvider>
    );

    const { result } = renderHook(() => useRecipeSearch(), { wrapper });

    act(() => {
      result.current.setSearchQuery('chicken');
    });

    expect(result.current.searchQuery).toBe('chicken');
  });

  it('updates filters when setFilter is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecipeSearchProvider>{children}</RecipeSearchProvider>
    );

    const { result } = renderHook(() => useRecipeSearch(), { wrapper });

    act(() => {
      result.current.setFilter('cuisine', 'italian');
    });

    expect(result.current.filters).toEqual({ cuisine: 'italian' });

    act(() => {
      result.current.setFilter('diet', 'vegetarian');
    });

    expect(result.current.filters).toEqual({
      cuisine: 'italian',
      diet: 'vegetarian'
    });

    act(() => {
      result.current.setFilter('cuisine', 'french');
    });

    expect(result.current.filters).toEqual({
      cuisine: 'french',
      diet: 'vegetarian'
    });
  });

  it('updates pageNumber when setPageNumber is called with a number', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecipeSearchProvider>{children}</RecipeSearchProvider>
    );

    const { result } = renderHook(() => useRecipeSearch(), { wrapper });

    act(() => {
      result.current.setPageNumber(3);
    });

    expect(result.current.pageNumber).toBe(3);
  });

  it('updates pageNumber when setPageNumber is called with a function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecipeSearchProvider>{children}</RecipeSearchProvider>
    );

    const { result } = renderHook(() => useRecipeSearch(), { wrapper });

    act(() => {
      result.current.setPageNumber((prev) => prev + 1);
    });

    expect(result.current.pageNumber).toBe(2);

    act(() => {
      result.current.setPageNumber((prev) => prev + 2);
    });

    expect(result.current.pageNumber).toBe(4);
  });

  it('updates resultsPerPage when setResultsPerPage is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecipeSearchProvider>{children}</RecipeSearchProvider>
    );

    const { result } = renderHook(() => useRecipeSearch(), { wrapper });

    act(() => {
      result.current.setResultsPerPage(20);
    });

    expect(result.current.resultsPerPage).toBe(20);
  });

  it('updates totalResults when setTotalResults is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecipeSearchProvider>{children}</RecipeSearchProvider>
    );

    const { result } = renderHook(() => useRecipeSearch(), { wrapper });

    act(() => {
      result.current.setTotalResults(100);
    });

    expect(result.current.totalResults).toBe(100);
  });

  it('resets only pagination when resetPagination is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecipeSearchProvider>{children}</RecipeSearchProvider>
    );

    const { result } = renderHook(() => useRecipeSearch(), { wrapper });

    act(() => {
      result.current.setSearchQuery('chicken');
      result.current.setFilter('cuisine', 'italian');
      result.current.setPageNumber(3);
      result.current.setResultsPerPage(20);
      result.current.setTotalResults(100);
    });

    act(() => {
      result.current.resetPagination();
    });

    expect(result.current.searchQuery).toBe('chicken');
    expect(result.current.filters).toEqual({ cuisine: 'italian' });
    expect(result.current.pageNumber).toBe(1);
    expect(result.current.resultsPerPage).toBe(10);
    expect(result.current.totalResults).toBe(100);
  });

  it('resets all search parameters when resetSearch is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecipeSearchProvider>{children}</RecipeSearchProvider>
    );

    const { result } = renderHook(() => useRecipeSearch(), { wrapper });

    act(() => {
      result.current.setSearchQuery('chicken');
      result.current.setFilter('cuisine', 'italian');
      result.current.setPageNumber(3);
      result.current.setResultsPerPage(20);
      result.current.setTotalResults(100);
    });

    act(() => {
      result.current.resetSearch();
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.filters).toEqual({});
    expect(result.current.pageNumber).toBe(1);
    expect(result.current.resultsPerPage).toBe(10);
    expect(result.current.totalResults).toBe(0);
  });

  it('maintains separate state for searchQuery, filters and pagination', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecipeSearchProvider>{children}</RecipeSearchProvider>
    );

    const { result } = renderHook(() => useRecipeSearch(), { wrapper });

    act(() => {
      result.current.setSearchQuery('chicken');
      result.current.setFilter('cuisine', 'italian');
      result.current.setPageNumber(3);
    });

    expect(result.current.searchQuery).toBe('chicken');
    expect(result.current.filters).toEqual({ cuisine: 'italian' });
    expect(result.current.pageNumber).toBe(3);

    act(() => {
      result.current.setSearchQuery('beef');
    });

    expect(result.current.searchQuery).toBe('beef');
    expect(result.current.filters).toEqual({ cuisine: 'italian' });
    expect(result.current.pageNumber).toBe(3);
  });

  it('throws error when useRecipeSearch is used outside of RecipeSearchProvider', () => {
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => renderHook(() => useRecipeSearch())).toThrow(
      'useRecipeSearch must be used within a RecipeSearchProvider'
    );

    console.error = originalError;
  });
});