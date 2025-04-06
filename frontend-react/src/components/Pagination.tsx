import type React from 'react';
import { useMemo, useCallback } from 'react';
import { useRecipeSearch } from '../context/RecipeSearchContext';
import Button from './Button';
import Dropdown from './Dropdown';
import '@styles/components/_pagination.scss';

const Pagination: React.FC = () => {
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

  const resultsPerPageOptions = [
    { value: '10', label: '10' },
    { value: '20', label: '20' },
    { value: '50', label: '50' },
  ];

  const handleResultsPerPageChange = useCallback(
    (value: string) => {
      const num = Number.parseInt(value, 10);
      setResultsPerPage(num);
      setPageNumber(1);
    },
    [setResultsPerPage, setPageNumber]
  );

  return (
    <div className="pagination">
      <div className="navigation">
        <Button size="medium" type="secondary" onClick={goToFirstPage} disabled={pageNumber === 1}>
          &lt;&lt;
        </Button>
        <Button size="medium" type="primary" onClick={goToPreviousPage} disabled={pageNumber === 1}>
          &lt;
        </Button>
        <span className="page-info">
          Page {pageNumber} of {totalPages}
        </span>
        <Button size="medium" type="primary" onClick={goToNextPage} disabled={pageNumber === totalPages}>
          &gt;
        </Button>
        <Button size="medium" type="secondary" onClick={goToLastPage} disabled={pageNumber === totalPages}>
          &gt;&gt;
        </Button>
      </div>
      <Dropdown
        className="results-filter"
        label="Results per page"
        id="results-per-page"
        options={resultsPerPageOptions}
        value={resultsPerPage.toString()}
        direction="up"
        onChange={handleResultsPerPageChange}
      />
    </div>
  );
};

export default Pagination;
