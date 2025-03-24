import type React from 'react';
import '@styles/components/_pagination.scss';
import Button from './Button';
import Dropdown from './Dropdown';

const Pagination: React.FC = () => {
  const resultsPerPageOptions = [
    { value: '10', label: '10' },
    { value: '20', label: '20' },
    { value: '50', label: '50' },
  ];

  return (
    <div className="pagination">
      <div className="navigation">
        <Button size="medium" type="secondary" disabled>
          &lt;&lt;
        </Button>
        <Button size="medium" type="primary" disabled>
          &lt;
        </Button>
        <span className="page-info">Page 1 of 4</span>
        <Button size="medium" type="primary">
          &gt;
        </Button>
        <Button size="medium" type="secondary">
          &gt;&gt;
        </Button>
      </div>
      <Dropdown
        className="results-filter"
        label="Results per page"
        id="results-per-page"
        options={resultsPerPageOptions}
      />
    </div>
  );
};

export default Pagination;
