import type { RecipeType } from '../types.ts';
import { useEffect, useState, useCallback } from 'react';
import { useRecipeSearch } from '../context/RecipeSearchContext';
import { fetchRecipes } from '../services/recipeService';
import { filters } from '../data/filterData';

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

  const [typedQuery, setTypedQuery] = useState(searchQuery);
  const [typedFilters, setTypedFilters] = useState<Record<string, string>>(globalFilters);
  const [recipes, setRecipes] = useState<RecipeType[]>([]);

  const fetchAndSetRecipes = useCallback(async () => {
    try {
      const offset = (pageNumber - 1) * resultsPerPage;
      const data = await fetchRecipes(globalFilters, searchQuery, resultsPerPage, offset);
      setRecipes(data.results);
      setTotalResults(data.totalResults);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
      setTotalResults(0);
    }
  }, [globalFilters, searchQuery, pageNumber, resultsPerPage, setTotalResults]);

  useEffect(() => {
    resetPagination();
  }, [resetPagination]);

  useEffect(() => {
    setTypedQuery(searchQuery);
    setTypedFilters(globalFilters);
  }, [searchQuery, globalFilters]);

  useEffect(() => {
    fetchAndSetRecipes();
  }, [fetchAndSetRecipes]);

  const handleSearch = () => {
    setSearchQuery(typedQuery);
    for (const [id, value] of Object.entries(typedFilters)) {
      setFilter(id, value);
    }
  };

  const handleReset = () => {
    resetSearch();
    setTypedQuery('');
    setTypedFilters({});
  };

  return {
    typedQuery,
    setTypedQuery,
    typedFilters,
    setTypedFilters,
    handleSearch,
    handleReset,
    paginatedCards: recipes,
    filterOptions: filters,
  };
};

export default useSearch;
