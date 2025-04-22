import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { FavoritesSearchProvider, useFavoritesSearchContext } from '@context/FavoriteSearchContext';
import '@testing-library/jest-dom';

describe('FavoritesSearchContext', () => {
  it('initializes with default values', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FavoritesSearchProvider>{children}</FavoritesSearchProvider>
    );

    const { result } = renderHook(() => useFavoritesSearchContext(), { wrapper });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.pageNumber).toBe(1);
    expect(result.current.resultsPerPage).toBe(10);
    expect(result.current.totalResults).toBe(0);
  });

  it('updates searchQuery when setSearchQuery is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FavoritesSearchProvider>{children}</FavoritesSearchProvider>
    );

    const { result } = renderHook(() => useFavoritesSearchContext(), { wrapper });

    act(() => {
      result.current.setSearchQuery('pasta');
    });

    expect(result.current.searchQuery).toBe('pasta');
  });

  it('updates pageNumber when setPageNumber is called with a number', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FavoritesSearchProvider>{children}</FavoritesSearchProvider>
    );

    const { result } = renderHook(() => useFavoritesSearchContext(), { wrapper });

    act(() => {
      result.current.setPageNumber(3);
    });

    expect(result.current.pageNumber).toBe(3);
  });

  it('updates pageNumber when setPageNumber is called with a function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FavoritesSearchProvider>{children}</FavoritesSearchProvider>
    );

    const { result } = renderHook(() => useFavoritesSearchContext(), { wrapper });

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
      <FavoritesSearchProvider>{children}</FavoritesSearchProvider>
    );

    const { result } = renderHook(() => useFavoritesSearchContext(), { wrapper });

    act(() => {
      result.current.setResultsPerPage(20);
    });

    expect(result.current.resultsPerPage).toBe(20);
  });

  it('updates totalResults when setTotalResults is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FavoritesSearchProvider>{children}</FavoritesSearchProvider>
    );

    const { result } = renderHook(() => useFavoritesSearchContext(), { wrapper });

    act(() => {
      result.current.setTotalResults(100);
    });

    expect(result.current.totalResults).toBe(100);
  });

  it('resets pagination when resetPagination is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FavoritesSearchProvider>{children}</FavoritesSearchProvider>
    );

    const { result } = renderHook(() => useFavoritesSearchContext(), { wrapper });

    act(() => {
      result.current.setPageNumber(3);
      result.current.setResultsPerPage(20);
    });

    expect(result.current.pageNumber).toBe(3);
    expect(result.current.resultsPerPage).toBe(20);

    act(() => {
      result.current.resetPagination();
    });

    expect(result.current.pageNumber).toBe(1);
    expect(result.current.resultsPerPage).toBe(10);
  });

  it('throws error when useFavoritesSearchContext is used outside of FavoritesSearchProvider', () => {
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => renderHook(() => useFavoritesSearchContext())).toThrow(
      'useFavoritesSearchContext must be used within a FavoritesSearchProvider'
    );

    console.error = originalError;
  });

  it('maintains separate state for searchQuery and pagination', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FavoritesSearchProvider>{children}</FavoritesSearchProvider>
    );

    const { result } = renderHook(() => useFavoritesSearchContext(), { wrapper });

    act(() => {
      result.current.setSearchQuery('pasta');
      result.current.setPageNumber(3);
      result.current.setResultsPerPage(20);
      result.current.setTotalResults(100);
    });

    expect(result.current.searchQuery).toBe('pasta');
    expect(result.current.pageNumber).toBe(3);
    expect(result.current.resultsPerPage).toBe(20);
    expect(result.current.totalResults).toBe(100);

    act(() => {
      result.current.setSearchQuery('pizza');
    });

    expect(result.current.searchQuery).toBe('pizza');
    expect(result.current.pageNumber).toBe(3);
    expect(result.current.resultsPerPage).toBe(20);
    expect(result.current.totalResults).toBe(100);
  });
});