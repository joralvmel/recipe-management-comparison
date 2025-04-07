import type React from 'react';
import Button from './Button';
import Dropdown from './Dropdown';
import usePagination from '../hooks/usePagination';
import '@styles/components/_pagination.scss';

const Pagination: React.FC = () => {
  const {
    pageNumber,
    totalPages,
    goToFirstPage,
    goToPreviousPage,
    goToNextPage,
    goToLastPage,
    resultsPerPage,
    handleResultsPerPageChange,
  } = usePagination();

  const resultsPerPageOptions = [
    { value: '10', label: '10' },
    { value: '20', label: '20' },
    { value: '50', label: '50' },
  ];

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
