import type React from 'react';
import Dropdown from './Dropdown';
import SearchBar from './SearchBar';

interface FiltersProps {
  filters: { label: string; id: string; options: { value: string; label: string }[] }[];
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  onFiltersChange?: (id: string, value: string) => void;
  onSearch?: () => void;
  autoSearch?: boolean;
  filterValues: Record<string, string>;
}

const Filters: React.FC<FiltersProps> = ({
                                           filters,
                                           searchQuery,
                                           onSearchQueryChange,
                                           onFiltersChange,
                                           onSearch,
                                           autoSearch = false,
                                           filterValues,
                                         }) => {
  return (
    <div className="filters">
      <div className="dropdowns">
        {filters.map((filter) => (
          <Dropdown
            key={filter.id}
            label={filter.label}
            id={filter.id}
            options={filter.options}
            value={filterValues[filter.id] || ''}
            onChange={(value) => onFiltersChange ? onFiltersChange(filter.id, value) : undefined}
          />
        ))}
      </div>
      <div className="filter search-input">
        <SearchBar
          placeholder="Search"
          value={searchQuery}
          onChange={onSearchQueryChange}
          onSearch={onSearch}
          autoSearch={autoSearch}
        />
      </div>
    </div>
  );
};

export default Filters;
