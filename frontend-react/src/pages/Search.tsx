import type React from 'react';
import useSearch from '../hooks/useSearch';
import Filters from '../components/Filters';
import Cards from '../components/Cards';
import Pagination from '../components/Pagination';
import '@styles/pages/_search.scss';

const Search: React.FC = () => {
  const {
    typedQuery,
    setTypedQuery,
    typedFilters,
    setTypedFilters,
    handleSearch,
    handleReset,
    paginatedCards,
    filterOptions,
  } = useSearch();

  return (
    <div className="search container">
      <h1>Search for Recipes</h1>
      <Filters
        filters={filterOptions}
        searchQuery={typedQuery}
        onSearchQueryChange={setTypedQuery}
        onFiltersChange={(id, value) =>
          setTypedFilters((prev) => ({ ...prev, [id]: value }))
        }
        onSearch={handleSearch}
        handleReset={handleReset}
        filterValues={typedFilters}
      />
      <Cards cards={paginatedCards} />
      <Pagination />
    </div>
  );
};

export default Search;
