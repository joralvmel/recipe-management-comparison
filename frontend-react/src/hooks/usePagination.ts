import { useMemo, useCallback } from 'react';

interface PaginationContext {
  pageNumber: number;
  setPageNumber: (page: number | ((prev: number) => number)) => void;
  resultsPerPage: number;
  setResultsPerPage: (num: number) => void;
  totalResults: number;
}

const usePagination = (context: PaginationContext) => {
  const {
    pageNumber,
    setPageNumber,
    resultsPerPage,
    setResultsPerPage,
    totalResults,
  } = context;

  const totalPages = useMemo(() => {
    return resultsPerPage > 0 ? Math.max(Math.ceil(totalResults / resultsPerPage), 1) : 1;
  }, [totalResults, resultsPerPage]);

  const canGoToNextPage = useMemo(() => pageNumber < totalPages, [pageNumber, totalPages]);
  const canGoToPreviousPage = useMemo(() => pageNumber > 1, [pageNumber]);

  const goToFirstPage = useCallback(() => setPageNumber(1), [setPageNumber]);
  const goToPreviousPage = useCallback(() => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  }, [setPageNumber]);
  const goToNextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(prev + 1, totalPages));
  }, [setPageNumber, totalPages]);
  const goToLastPage = useCallback(() => setPageNumber(totalPages), [setPageNumber, totalPages]);

  const handleResultsPerPageChange = useCallback(
    (value: string) => {
      const num = Number.parseInt(value, 10);
      setResultsPerPage(num);
      setPageNumber(1);
    },
    [setResultsPerPage, setPageNumber]
  );

  return {
    pageNumber,
    totalPages,
    canGoToNextPage,
    canGoToPreviousPage,
    goToFirstPage,
    goToPreviousPage,
    goToNextPage,
    goToLastPage,
    resultsPerPage,
    handleResultsPerPageChange,
  };
};

export default usePagination;
