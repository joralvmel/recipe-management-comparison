import type { UseQueryResult } from '@tanstack/react-query';
import type { FetchRecipesResponse } from '../types';
import { useQuery } from '@tanstack/react-query';
import { fetchRecipes } from '../services/recipeService';
import { useRecipeSearch } from '../context/RecipeSearchContext';

export const useRecipesQuery = (
  filters: Record<string, string>,
  searchQuery: string,
  pageNumber: number,
  resultsPerPage: number
): UseQueryResult<FetchRecipesResponse, Error> => {
  const { setTotalResults } = useRecipeSearch();
  const offset = (pageNumber - 1) * resultsPerPage;
  const serializedFilters = JSON.stringify(filters);

  return useQuery<FetchRecipesResponse, Error>({
    queryKey: ['recipes', serializedFilters, searchQuery, pageNumber, resultsPerPage],
    queryFn: async (): Promise<FetchRecipesResponse> => {
      return fetchRecipes(filters, searchQuery, resultsPerPage, offset);
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60,
    keepPreviousData: true,
    onSuccess: (data: FetchRecipesResponse) => {
      setTotalResults(data.totalResults);
    },
  });
};
