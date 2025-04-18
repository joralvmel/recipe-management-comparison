import type { UseQueryResult } from '@tanstack/react-query';
import type { FetchRecipesResponse } from '../types';
import { useQuery } from '@tanstack/react-query';
import { fetchRecipes } from '../services/recipeService';

export const useRecipesQuery = (
  filters: Record<string, string>,
  searchQuery: string,
  pageNumber: number,
  resultsPerPage: number
): UseQueryResult<FetchRecipesResponse, Error> => {

  return useQuery<FetchRecipesResponse, Error, FetchRecipesResponse>({
    queryKey: ['recipes', filters, searchQuery, pageNumber, resultsPerPage],
    queryFn: () =>
      fetchRecipes(filters, searchQuery, resultsPerPage, (pageNumber - 1) * resultsPerPage),
    staleTime: 5 * 60 * 1000,
  });
};
