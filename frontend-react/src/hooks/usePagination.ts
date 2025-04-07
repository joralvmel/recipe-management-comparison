import { useMemo, useCallback } from 'react';
import { useRecipeSearch } from '../context/RecipeSearchContext';

const usePagination = () => {
  const {
    pageNumber,
    setPageNumber,
    resultsPerPage,
    setResultsPerPage,
    totalResults,
  } = useRecipeSearch();

  const totalPages = useMemo(() => {
    return resultsPerPage > 0 ? Math.ceil(totalResults / resultsPerPage) : 1;
  }, [totalResults, resultsPerPage]);

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
    goToFirstPage,
    goToPreviousPage,
    goToNextPage,
    goToLastPage,
    resultsPerPage,
    handleResultsPerPageChange,
  };
};

export default usePagination;
