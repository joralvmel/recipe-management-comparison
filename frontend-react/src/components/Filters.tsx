import type React from 'react';
import Dropdown from './Dropdown';
import SearchBar from './SearchBar';

interface FiltersProps {
  filters: { label: string; id: string; options: { value: string; label: string }[] }[];
}

const Filters: React.FC<FiltersProps> = ({ filters }) => {
  return (
    <div className="filters">
      <div className="dropdowns">
        {filters.map((filter) => (
          <Dropdown key={filter.id} label={filter.label} id={filter.id} options={filter.options} />
        ))}
      </div>
      <div className="filter search-input">
        <SearchBar placeholder="Search" />
      </div>
    </div>
  );
};

export default Filters;