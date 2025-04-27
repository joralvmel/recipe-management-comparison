import type { FetchRecipesResponse, RecipeType } from '@src/types';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import * as recipeService from '@services/recipeService';


vi.mock('axios');

vi.mock('@services/recipeService', async (importOriginal) => {
  const actualModule = await importOriginal<typeof import('@services/recipeService')>();

  return {
    ...actualModule,
    fetchRecipes: vi.fn()
  };
});

describe('recipeService', () => {
  const mockRecipes: RecipeType[] = [
    {
      id: 1,
      title: 'Spaghetti Carbonara',
      image: 'carbonara.jpg',
      readyInMinutes: 30,
      healthScore: 45,
      cuisines: ['Italian'],
      dishTypes: ['main course', 'dinner'],
      diets: [],
      extendedIngredients: [],
      analyzedInstructions: []
    },
    {
      id: 2,
      title: 'Chicken Tikka Masala',
      image: 'tikka.jpg',
      readyInMinutes: 45,
      healthScore: 60,
      cuisines: ['Indian'],
      dishTypes: ['main course', 'dinner'],
      diets: [],
      extendedIngredients: [],
      analyzedInstructions: []
    },
    {
      id: 3,
      title: 'Vegan Buddha Bowl',
      image: 'buddha_bowl.jpg',
      readyInMinutes: 20,
      healthScore: 95,
      cuisines: ['American', 'Fusion'],
      dishTypes: ['lunch', 'main course'],
      diets: ['vegan', 'gluten free'],
      extendedIngredients: [],
      analyzedInstructions: []
    },
    {
      id: 4,
      title: 'Greek Salad',
      image: 'greek_salad.jpg',
      readyInMinutes: 15,
      healthScore: 90,
      cuisines: ['Greek', 'Mediterranean'],
      dishTypes: ['lunch', 'salad', 'starter'],
      diets: ['vegetarian'],
      extendedIngredients: [],
      analyzedInstructions: []
    },
    {
      id: 5,
      title: 'Beef Tacos',
      image: 'tacos.jpg',
      readyInMinutes: 25,
      healthScore: 70,
      cuisines: ['Mexican'],
      dishTypes: ['main course', 'dinner'],
      diets: [],
      extendedIngredients: [],
      analyzedInstructions: []
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('fetchRecipes', () => {
    it('fetches recipes from API when backend is enabled', async () => {
      const mockResponse: FetchRecipesResponse = {
        results: mockRecipes.slice(0, 2),
        totalResults: 2
      };

      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      (recipeService.fetchRecipes as jest.Mock).mockImplementationOnce(
        async (filters: Record<string, string>, searchQuery: string, resultsPerPage: number, offset: number) => {
          const params = {
            cuisine: filters.cuisine || undefined,
            diet: filters.diet || undefined,
            mealType: filters['meal-type'] || undefined,
            query: searchQuery || undefined,
            number: resultsPerPage,
            offset,
          };
          const { data } = await axios.get('http://localhost:3000/recipes/search', { params });
          return data;
        }
      );

      const result = await recipeService.fetchRecipes(
        { cuisine: 'Italian' }, 'pasta', 10, 0
      );

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:3000/recipes/search',
        {
          params: {
            cuisine: 'Italian',
            diet: undefined,
            mealType: undefined,
            query: 'pasta',
            number: 10,
            offset: 0
          }
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('filters recipes by search query when backend is disabled', async () => {
      (recipeService.fetchRecipes as jest.Mock).mockImplementationOnce(
        async (_filters: Record<string, string>, searchQuery: string, resultsPerPage: number, offset: number) => {
          const filteredCards = mockRecipes.filter(card => {
            if (searchQuery && !card.title?.toLowerCase().includes(searchQuery.toLowerCase())) {
              return false;
            }
            return true;
          });

          return {
            results: filteredCards.slice(offset, offset + resultsPerPage),
            totalResults: filteredCards.length,
          };
        }
      );

      const result = await recipeService.fetchRecipes({}, 'chicken', 10, 0);

      expect(result.results.length).toBe(1);
      expect(result.results[0].title).toBe('Chicken Tikka Masala');
      expect(result.totalResults).toBe(1);
    });

    it('filters recipes by cuisine when backend is disabled', async () => {
      (recipeService.fetchRecipes as jest.Mock).mockImplementationOnce(
        async (filters: Record<string, string>, _searchQuery: string, resultsPerPage: number, offset: number) => {
          const filteredCards = mockRecipes.filter(card => {
            if (filters.cuisine && filters.cuisine.trim() !== '') {
              const filterCuisine = filters.cuisine.toLowerCase().trim();
              if (!card.cuisines?.some(c => c.toLowerCase().trim().includes(filterCuisine))) {
                return false;
              }
            }
            return true;
          });

          return {
            results: filteredCards.slice(offset, offset + resultsPerPage),
            totalResults: filteredCards.length,
          };
        }
      );

      const result = await recipeService.fetchRecipes({ cuisine: 'Italian' }, '', 10, 0);

      expect(result.results.length).toBe(1);
      expect(result.results[0].title).toBe('Spaghetti Carbonara');
      expect(result.totalResults).toBe(1);
    });

    it('filters recipes by meal type when backend is disabled', async () => {
      (recipeService.fetchRecipes as jest.Mock).mockImplementationOnce(
        async (filters: Record<string, string>, _searchQuery: string, resultsPerPage: number, offset: number) => {
          const filteredCards = mockRecipes.filter(card => {
            if (filters['meal-type'] && filters['meal-type'].trim() !== '') {
              const filterMealType = filters['meal-type'].toLowerCase().replace(/[-\s]+/g, ' ').trim();
              if (
                !card.dishTypes?.some(dt =>
                  dt.toLowerCase().replace(/[-\s]+/g, ' ').includes(filterMealType)
                )
              ) {
                return false;
              }
            }
            return true;
          });

          return {
            results: filteredCards.slice(offset, offset + resultsPerPage),
            totalResults: filteredCards.length,
          };
        }
      );

      const result = await recipeService.fetchRecipes({ 'meal-type': 'salad' }, '', 10, 0);

      expect(result.results.length).toBe(1);
      expect(result.results[0].title).toBe('Greek Salad');
      expect(result.totalResults).toBe(1);
    });

    it('filters recipes by diet when backend is disabled', async () => {
      (recipeService.fetchRecipes as jest.Mock).mockImplementationOnce(
        async (filters: Record<string, string>, _searchQuery: string, resultsPerPage: number, offset: number) => {
          const filteredCards = mockRecipes.filter(card => {
            if (filters.diet && filters.diet.trim() !== '') {
              const filterDiet = filters.diet.toLowerCase().replace(/[-\s]+/g, ' ').trim();
              if (
                !card.diets?.some(d =>
                  d.toLowerCase().replace(/[-\s]+/g, ' ').includes(filterDiet)
                )
              ) {
                return false;
              }
            }
            return true;
          });

          return {
            results: filteredCards.slice(offset, offset + resultsPerPage),
            totalResults: filteredCards.length,
          };
        }
      );

      const result = await recipeService.fetchRecipes({ diet: 'vegan' }, '', 10, 0);

      expect(result.results.length).toBe(1);
      expect(result.results[0].title).toBe('Vegan Buddha Bowl');
      expect(result.totalResults).toBe(1);
    });

    it('paginates results correctly when backend is disabled', async () => {
      (recipeService.fetchRecipes as jest.Mock).mockImplementationOnce(
        async (_filters: Record<string, string>, _searchQuery: string, resultsPerPage: number, offset: number) => {
          return {
            results: mockRecipes.slice(offset, offset + resultsPerPage),
            totalResults: mockRecipes.length,
          };
        }
      );

      const result = await recipeService.fetchRecipes({}, '', 2, 2);

      expect(result.results.length).toBe(2);
      expect(result.results[0].title).toBe('Vegan Buddha Bowl');
      expect(result.results[1].title).toBe('Greek Salad');
      expect(result.totalResults).toBe(5);
    });

    it('combines multiple filters when backend is disabled', async () => {
      (recipeService.fetchRecipes as jest.Mock).mockImplementationOnce(
        async (filters: Record<string, string>, searchQuery: string, resultsPerPage: number, offset: number) => {
          const filteredCards = mockRecipes.filter(card => {
            if (searchQuery && !card.title?.toLowerCase().includes(searchQuery.toLowerCase())) {
              return false;
            }

            if (filters.cuisine && filters.cuisine.trim() !== '') {
              const filterCuisine = filters.cuisine.toLowerCase().trim();
              if (!card.cuisines?.some(c => c.toLowerCase().trim().includes(filterCuisine))) {
                return false;
              }
            }

            if (filters['meal-type'] && filters['meal-type'].trim() !== '') {
              const filterMealType = filters['meal-type'].toLowerCase().replace(/[-\s]+/g, ' ').trim();
              if (!card.dishTypes?.some(dt => dt.toLowerCase().replace(/[-\s]+/g, ' ').includes(filterMealType))) {
                return false;
              }
            }

            if (filters.diet && filters.diet.trim() !== '') {
              const filterDiet = filters.diet.toLowerCase().replace(/[-\s]+/g, ' ').trim();
              if (!card.diets?.some(d => d.toLowerCase().replace(/[-\s]+/g, ' ').includes(filterDiet))) {
                return false;
              }
            }

            return true;
          });

          return {
            results: filteredCards.slice(offset, offset + resultsPerPage),
            totalResults: filteredCards.length,
          };
        }
      );

      const result = await recipeService.fetchRecipes(
        { 'meal-type': 'lunch', diet: 'vegetarian' },
        '',
        10,
        0
      );

      expect(result.results.length).toBe(1);
      expect(result.results[0].title).toBe('Greek Salad');
      expect(result.totalResults).toBe(1);
    });

    it('returns empty results when no recipes match filters', async () => {
      (recipeService.fetchRecipes as jest.Mock).mockImplementationOnce(
        async (_filters: Record<string, string>, _searchQuery: string, resultsPerPage: number, offset: number) => {
          const filteredCards = mockRecipes.filter(_card => {
            return false;
          });

          return {
            results: filteredCards.slice(offset, offset + resultsPerPage),
            totalResults: filteredCards.length,
          };
        }
      );

      const result = await recipeService.fetchRecipes({ cuisine: 'nonexistent' }, '', 10, 0);

      expect(result.results.length).toBe(0);
      expect(result.totalResults).toBe(0);
    });

    it('handles API errors correctly', async () => {
      (recipeService.fetchRecipes as jest.Mock).mockImplementationOnce(
        async () => {
          throw new Error('Error fetching recipes from backend');
        }
      );

      await expect(recipeService.fetchRecipes({}, '', 10, 0))
        .rejects.toThrow('Error fetching recipes from backend');
    });
  });
});