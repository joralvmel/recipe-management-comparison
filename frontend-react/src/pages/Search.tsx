import type React from 'react';
import { useRecipeSearch } from '@context/RecipeSearchContext';
import useSearch from '@hooks/useSearch';
import Filters from '@components/Filters';
import Cards from '@components/Cards';
import Pagination from '@components/Pagination';
import Loader from '@components/Loader';
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
    loading,
  } = useSearch();

  const paginationContext = useRecipeSearch();

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
      {loading ? (
        <Loader message="Loading recipes..." size="large" />
      ) : (
        <>
          <Cards recipes={paginatedCards} />
          <Pagination context={paginationContext} />
        </>
      )}
    </div>
  );
};

export default Search;
