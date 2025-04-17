import { useState, useEffect } from 'react';
import { useRecipesQuery } from './useRecipesQuery';
import { useRecipeSearch } from '../context/RecipeSearchContext';
import { filters } from '../data/filterData';
import { useSnackbar } from '../context/SnackbarContext';

const useSearch = () => {
  const {
    searchQuery,
    setSearchQuery,
    filters: globalFilters,
    setFilter,
    setTotalResults,
    pageNumber,
    resultsPerPage,
    resetSearch,
    resetPagination,
  } = useRecipeSearch();

  const { showSnackbar } = useSnackbar();
  const [typedQuery, setTypedQuery] = useState(searchQuery);
  const [typedFilters, setTypedFilters] = useState<Record<string, string>>(globalFilters);

  const { data, error, isLoading } = useRecipesQuery(
    globalFilters,
    searchQuery,
    pageNumber,
    resultsPerPage
  );

  useEffect(() => {
    if (data?.totalResults != null) {
      setTotalResults(data.totalResults);
    }
  }, [data?.totalResults, setTotalResults]);

  const handleSearch = () => {
    resetPagination();
    setSearchQuery(typedQuery);
    for (const [id, value] of Object.entries(typedFilters)) {
      setFilter(id, value);
    }
  };

  const handleReset = () => {
    resetSearch();
    setTypedQuery('');
    setTypedFilters({});
    showSnackbar('Filters reset', 'info');
  };

  if (error) {
    showSnackbar('Error fetching recipes', 'error');
  }

  return {
    typedQuery,
    setTypedQuery,
    typedFilters,
    setTypedFilters,
    handleSearch,
    handleReset,
    paginatedCards: data?.results || [],
    filterOptions: filters,
    loading: isLoading,
  };
};

export default useSearch;
