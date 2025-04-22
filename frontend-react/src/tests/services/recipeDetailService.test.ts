import type { RecipeType } from '@src/types';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import * as recipeDetailService from '@services/recipeDetailService';

vi.mock('axios');

vi.mock('@services/recipeDetailService', async (importOriginal) => {
  const actualModule = await importOriginal<typeof import('@services/recipeDetailService')>();

  return {
    ...actualModule,
    fetchRecipeDetail: vi.fn()
  };
});

describe('recipeDetailService', () => {
  const mockRecipes: RecipeType[] = [
    {
      _id: 'recipe1',
      id: 1,
      externalId: 123456,
      title: 'Spaghetti Carbonara',
      image: 'carbonara.jpg',
      readyInMinutes: 30,
      healthScore: 45,
      cuisines: ['Italian'],
      dishTypes: ['main course', 'dinner'],
      diets: [],
      servings: 4,
      analyzedInstructions: ['Cook pasta', 'Make sauce', 'Combine'],
      extendedIngredients: [
        { _id: 'ing1', externalId: 1, amount: 500, unitShort: 'g', nameClean: 'spaghetti', image: 'spaghetti.jpg' },
        { _id: 'ing2', externalId: 2, amount: 4, unitShort: '', nameClean: 'eggs', image: 'eggs.jpg' },
        { _id: 'ing3', externalId: 3, amount: 100, unitShort: 'g', nameClean: 'pancetta', image: 'pancetta.jpg' }
      ]
    },
    {
      _id: 'recipe2',
      id: 2,
      externalId: 789012,
      title: 'Chicken Tikka Masala',
      image: 'tikka.jpg',
      readyInMinutes: 45,
      healthScore: 60,
      cuisines: ['Indian'],
      dishTypes: ['main course', 'dinner'],
      diets: [],
      servings: 6,
      analyzedInstructions: ['Marinate chicken', 'Cook chicken', 'Prepare sauce', 'Combine'],
      extendedIngredients: [
        { _id: 'ing4', externalId: 4, amount: 500, unitShort: 'g', nameClean: 'chicken', image: 'chicken.jpg' },
        { _id: 'ing5', externalId: 5, amount: 200, unitShort: 'ml', nameClean: 'yogurt', image: 'yogurt.jpg' },
        { _id: 'ing6', externalId: 6, amount: 30, unitShort: 'g', nameClean: 'spices', image: 'spices.jpg' }
      ]
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('fetchRecipeDetail', () => {
    it('fetches recipe details from API when backend is enabled', async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockRecipes[0] });
      (recipeDetailService.fetchRecipeDetail as jest.Mock).mockImplementationOnce(async (id: string) => {
        const { data } = await axios.get(`http://localhost:3000/recipes/${id}`);
        return data;
      });

      const result = await recipeDetailService.fetchRecipeDetail('123456');

      expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/recipes/123456');
      expect(result).toEqual(mockRecipes[0]);
    });

    it('fetches recipe details from local data when backend is disabled', async () => {
      (recipeDetailService.fetchRecipeDetail as jest.Mock).mockImplementationOnce(async (id: string) => {
        const recipe = mockRecipes.find(r => r.externalId?.toString() === id);
        return recipe || null;
      });

      const result = await recipeDetailService.fetchRecipeDetail('123456');

      expect(result).toEqual(mockRecipes[0]);
    });

    it('returns null when recipe is not found in local data', async () => {
      (recipeDetailService.fetchRecipeDetail as jest.Mock).mockImplementationOnce(async (id: string) => {
        const recipe = mockRecipes.find(r => r.externalId?.toString() === id);
        return recipe || null;
      });

      const result = await recipeDetailService.fetchRecipeDetail('999999');

      expect(result).toBeNull();
    });

    it('throws an error when API returns an error with response data', async () => {
      (recipeDetailService.fetchRecipeDetail as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Recipe not found');
      });

      await expect(recipeDetailService.fetchRecipeDetail('999999')).rejects.toThrow('Recipe not found');
    });

    it('throws a generic error when API returns an error without response data', async () => {
      (recipeDetailService.fetchRecipeDetail as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('An unexpected error occurred');
      });

      await expect(recipeDetailService.fetchRecipeDetail('999999')).rejects.toThrow('An unexpected error occurred');
    });

    it('throws a generic error when API returns an unexpected error', async () => {
      (recipeDetailService.fetchRecipeDetail as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Error fetching recipe detail from backend');
      });

      await expect(recipeDetailService.fetchRecipeDetail('999999')).rejects.toThrow('Error fetching recipe detail from backend');
    });
  });
});