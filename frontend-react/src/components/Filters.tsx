import type React from 'react';
import Dropdown from './Dropdown';
import SearchBar from './SearchBar';

interface FiltersProps {
  filters: { label: string; id: string; options: { value: string; label: string }[] }[];
  displayFilters?: boolean;
}

const Filters: React.FC<FiltersProps> = ({ filters, displayFilters = true }) => {
  return (
    <div className={`${displayFilters ? "filters" : 'filter search-input'}`}>
      {displayFilters && (
        <div className="dropdowns">
          {filters.map((filter) => (
            <Dropdown key={filter.id} label={filter.label} id={filter.id} options={filter.options} />
          ))}
        </div>
      )}
      {displayFilters ? (
        <div className="filter search-input">
          <SearchBar placeholder="Search" />
        </div>
      ) : (
        <SearchBar placeholder="Search" />
      )}
    </div>
  );
};

export default Filters;