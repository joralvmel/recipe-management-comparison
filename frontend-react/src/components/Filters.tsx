import type React from 'react';
import Dropdown from './Dropdown';
import SearchBar from './SearchBar';
import { useRecipeSearch } from '../context/RecipeSearchContext';

interface FiltersProps {
  filters: { label: string; id: string; options: { value: string; label: string }[] }[];
  displayFilters?: boolean;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  autoSearch?: boolean;
}

const Filters: React.FC<FiltersProps> = ({
                                           filters,
                                           displayFilters = true,
                                           searchQuery,
                                           onSearchQueryChange,
                                           autoSearch = false,
                                         }) => {
  const { setFilter } = useRecipeSearch();

  return (
    <div className={`${displayFilters ? "filters" : "filter search-input"}`}>
      {displayFilters && (
        <div className="dropdowns">
          {filters.map((filter) => (
            <Dropdown
              key={filter.id}
              label={filter.label}
              id={filter.id}
              options={filter.options}
              onChange={(value) => setFilter(filter.id, value)}
            />
          ))}
        </div>
      )}
      <div className="filter search-input">
        <SearchBar
          placeholder={displayFilters ? "Search" : "Search Favorites"}
          value={searchQuery}
          onChange={onSearchQueryChange}
          autoSearch={autoSearch}
        />
      </div>
    </div>
  );
};

export default Filters;
