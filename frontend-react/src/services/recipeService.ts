import type { FetchRecipesResponse } from '@src/types';
import axios, { AxiosError } from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/recipes/search`;
const useBackend = import.meta.env.VITE_USE_BACKEND === 'true';

export const fetchRecipes = async (
  filters: Record<string, string>,
  searchQuery: string,
  resultsPerPage: number,
  offset: number
): Promise<FetchRecipesResponse> => {
  if (!useBackend) {
    const { cardData } = await import('@data/cardData');
    const filteredCards = cardData.filter((card) => {
      if (
        searchQuery &&
        !card.title?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (filters.cuisine && filters.cuisine.trim() !== '') {
        const filterCuisine = filters.cuisine.toLowerCase().trim();
        if (!card.cuisines?.some((c) => c.toLowerCase().trim().includes(filterCuisine))) {
          return false;
        }
      }
      if (filters['meal-type'] && filters['meal-type'].trim() !== '') {
        const filterMealType = filters['meal-type']
          .toLowerCase()
          .replace(/[-\s]+/g, ' ')
          .trim();
        if (
          !card.dishTypes?.some((dt) =>
            dt.toLowerCase().replace(/[-\s]+/g, ' ').includes(filterMealType)
          )
        ) {
          return false;
        }
      }
      if (filters.diet && filters.diet.trim() !== '') {
        const filterDiet = filters.diet.toLowerCase().replace(/[-\s]+/g, ' ').trim();
        if (
          !card.diets?.some((d) =>
            d.toLowerCase().replace(/[-\s]+/g, ' ').includes(filterDiet)
          )
        ) {
          return false;
        }
      }
      return true;
    });

    const sliced = filteredCards.slice(offset, offset + resultsPerPage).map((card) => ({
      id: card.id ?? 0,
      title: card.title || 'Untitled',
      image: card.image || '',
      readyInMinutes: card.readyInMinutes || 0,
      healthScore: card.healthScore || 0,
      cuisines: card.cuisines || [],
      dishTypes: card.dishTypes || [],
      diets: card.diets || [],
    }));

    return {
      results: sliced,
      totalResults: filteredCards.length,
    };
  }

  try {
    const params = {
      cuisine: filters.cuisine || undefined,
      diet: filters.diet || undefined,
      mealType: filters['meal-type'] || undefined,
      query: searchQuery || undefined,
      number: resultsPerPage,
      offset,
    };
    const { data } = await axios.get<FetchRecipesResponse>(API_URL, { params });
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.message || 'Error fetching recipes from backend');
    }
    throw new Error('An unexpected error occurred');
  }
};
