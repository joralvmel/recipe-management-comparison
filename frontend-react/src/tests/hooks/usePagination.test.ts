import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import usePagination from '@hooks/usePagination';

describe('usePagination', () => {
  const createMockContext = (
    pageNumber = 1,
    resultsPerPage = 10,
    totalResults = 100
  ) => ({
    pageNumber,
    setPageNumber: vi.fn((updater) => {
      if (typeof updater === 'function') {
        return updater(pageNumber);
      }
      return updater;
    }),
    resultsPerPage,
    setResultsPerPage: vi.fn(),
    totalResults,
  });

  it('initializes with correct values', () => {
    const mockContext = createMockContext(2, 20, 100);
    const { result } = renderHook(() => usePagination(mockContext));

    expect(result.current.pageNumber).toBe(2);
    expect(result.current.resultsPerPage).toBe(20);
    expect(result.current.totalPages).toBe(5);
    expect(result.current.canGoToNextPage).toBe(true);
    expect(result.current.canGoToPreviousPage).toBe(true);
  });

  it('calculates total pages correctly', () => {
    const testCases = [
      { totalResults: 100, resultsPerPage: 10, expected: 10 },
      { totalResults: 101, resultsPerPage: 10, expected: 11 },
      { totalResults: 0, resultsPerPage: 10, expected: 1 },
      { totalResults: 10, resultsPerPage: 100, expected: 1 },
      { totalResults: 100, resultsPerPage: 0, expected: 1 },
    ];

    for (const { totalResults, resultsPerPage, expected } of testCases) {
      const mockContext = createMockContext(1, resultsPerPage, totalResults);
      const { result } = renderHook(() => usePagination(mockContext));
      expect(result.current.totalPages).toBe(expected);
    }
  });

  it('determines if can go to next page correctly', () => {
    const testCases = [
      { page: 1, totalPages: 3, expected: true },
      { page: 3, totalPages: 3, expected: false },
      { page: 2, totalPages: 3, expected: true },
    ];

    for (const { page, totalPages, expected } of testCases) {
      const mockContext = createMockContext(
        page,
        10,
        totalPages * 10
      );
      const { result } = renderHook(() => usePagination(mockContext));
      expect(result.current.canGoToNextPage).toBe(expected);
    }
  });

  it('determines if can go to previous page correctly', () => {
    const testCases = [
      { page: 1, expected: false },
      { page: 2, expected: true },
      { page: 10, expected: true },
    ];

    for (const { page, expected } of testCases) {
      const mockContext = createMockContext(page, 10, 100);
      const { result } = renderHook(() => usePagination(mockContext));
      expect(result.current.canGoToPreviousPage).toBe(expected);
    }
  });

  it('goes to first page', () => {
    const mockContext = createMockContext(5, 10, 100);
    const { result } = renderHook(() => usePagination(mockContext));

    act(() => {
      result.current.goToFirstPage();
    });

    expect(mockContext.setPageNumber).toHaveBeenCalledWith(1);
  });

  it('goes to previous page', () => {
    const mockContext = createMockContext(5, 10, 100);
    const { result } = renderHook(() => usePagination(mockContext));

    act(() => {
      result.current.goToPreviousPage();
    });

    expect(mockContext.setPageNumber).toHaveBeenCalled();
    expect(mockContext.setPageNumber.mock.results[0].value).toBe(4);
  });

  it('goes to next page', () => {
    const mockContext = createMockContext(5, 10, 100);
    const { result } = renderHook(() => usePagination(mockContext));

    act(() => {
      result.current.goToNextPage();
    });

    expect(mockContext.setPageNumber).toHaveBeenCalled();
    expect(mockContext.setPageNumber.mock.results[0].value).toBe(6);
  });

  it('does not go beyond last page', () => {
    const mockContext = createMockContext(10, 10, 100);
    const { result } = renderHook(() => usePagination(mockContext));

    act(() => {
      result.current.goToNextPage();
    });

    expect(mockContext.setPageNumber).toHaveBeenCalled();
    expect(mockContext.setPageNumber.mock.results[0].value).toBe(10);
  });

  it('goes to last page', () => {
    const mockContext = createMockContext(5, 10, 100);
    const { result } = renderHook(() => usePagination(mockContext));

    act(() => {
      result.current.goToLastPage();
    });

    expect(mockContext.setPageNumber).toHaveBeenCalledWith(10);
  });

  it('handles results per page change', () => {
    const mockContext = createMockContext(5, 10, 100);
    const { result } = renderHook(() => usePagination(mockContext));

    act(() => {
      result.current.handleResultsPerPageChange('20');
    });

    expect(mockContext.setResultsPerPage).toHaveBeenCalledWith(20);
    expect(mockContext.setPageNumber).toHaveBeenCalledWith(1);
  });

  it('handles integer parsing in results per page change', () => {
    const mockContext = createMockContext(5, 10, 100);
    const { result } = renderHook(() => usePagination(mockContext));

    act(() => {
      result.current.handleResultsPerPageChange('invalid'); // NaN
    });

    expect(mockContext.setResultsPerPage).toHaveBeenCalledWith(Number.NaN);
  });

  it('recalculates dependent values when context changes', () => {
    const initialContext = createMockContext(1, 10, 100);
    const { result, rerender } = renderHook(
      (context) => usePagination(context),
      { initialProps: initialContext }
    );

    expect(result.current.totalPages).toBe(10);
    expect(result.current.canGoToNextPage).toBe(true);
    expect(result.current.canGoToPreviousPage).toBe(false);

    const updatedContext = createMockContext(3, 20, 50);

    rerender(updatedContext);

    expect(result.current.totalPages).toBe(3);
    expect(result.current.canGoToNextPage).toBe(false);
    expect(result.current.canGoToPreviousPage).toBe(true);
  });
});