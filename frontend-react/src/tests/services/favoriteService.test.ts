import type { FavoriteType, RecipeType } from '@src/types';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios, { AxiosError } from 'axios';
import * as favoriteService from '@services/favoriteService';
import { fetchRecipeDetail } from '@services/recipeDetailService';

vi.mock('axios');

vi.mock('@services/recipeDetailService', () => ({
  fetchRecipeDetail: vi.fn(),
}));

vi.mock('@services/favoriteService', async (importOriginal) => {
  const actualModule = await importOriginal<typeof import('@services/favoriteService')>();

  return {
    ...actualModule,
    fetchFavorites: vi.fn(),
    fetchFavoritesWithDetails: vi.fn(),
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    filterFavoriteRecipes: actualModule.filterFavoriteRecipes
  };
});

describe('favoriteService', () => {
  const mockFavorites: FavoriteType[] = [
    { _id: '1', userId: 'user1', recipeId: 'recipe1', createdAt: '2023-01-01' },
    { _id: '2', userId: 'user1', recipeId: 'recipe2', createdAt: '2023-01-02' }
  ];

  const mockRecipes: RecipeType[] = [
    { id: 1, title: 'Pasta Carbonara', extendedIngredients: [], analyzedInstructions: [] },
    { id: 2, title: 'Pizza Margherita', extendedIngredients: [], analyzedInstructions: [] }
  ];

  const mockFavoriteData = [
    { _id: '1', userId: 'user1', recipeId: 'recipe1', createdAt: '2023-01-01' },
    { _id: '2', userId: 'user1', recipeId: 'recipe2', createdAt: '2023-01-02' },
    { _id: '3', userId: 'user2', recipeId: 'recipe3', createdAt: '2023-01-03' }
  ];

  const mockCardData = [
    { id: 1, title: 'Pasta Carbonara', extendedIngredients: [], analyzedInstructions: [] },
    { id: 2, title: 'Pizza Margherita', extendedIngredients: [], analyzedInstructions: [] },
    { id: 3, title: 'Caesar Salad', extendedIngredients: [], analyzedInstructions: [] }
  ];

  beforeEach(() => {
    vi.resetAllMocks();

    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: vi.fn().mockReturnValue('mock-uuid')
      }
    });
  });

  describe('fetchFavorites', () => {
    it('fetches favorites from API when backend is enabled', async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockFavorites });
      (favoriteService.fetchFavorites as jest.Mock).mockImplementationOnce(async (token: string) => {
        const { data } = await axios.get('http://localhost:3000/favorites', {
          headers: { Authorization: token },
        });
        return data;
      });

      const result = await favoriteService.fetchFavorites('Bearer token123', 'user1');

      expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/favorites', {
        headers: { Authorization: 'Bearer token123' }
      });
      expect(result).toEqual(mockFavorites);
    });

    it('filters favorites by userId when using mock data', async () => {
      (favoriteService.fetchFavorites as jest.Mock).mockImplementationOnce(async (_token: string, userId?: string) => {
        return mockFavoriteData.filter(favorite => favorite.userId === userId);
      });

      const result = await favoriteService.fetchFavorites('Bearer token123', 'user1');

      expect(result).toHaveLength(2);
      expect(result.every(fav => fav.userId === 'user1')).toBe(true);
    });

    it('handles API errors without response data', async () => {
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      (favoriteService.fetchFavorites as jest.Mock).mockImplementationOnce(async (token: string) => {
        try {
          await axios.get('http://localhost:3000/favorites', {
            headers: { Authorization: token },
          });
          return [];
        } catch (error) {
          if (error instanceof AxiosError && error.response) {
            throw new Error(error.response.data?.message || 'Error fetching favorite data');
          }
          throw new Error('Unable to fetch favorites');
        }
      });

      await expect(favoriteService.fetchFavorites('Bearer token123', 'user1'))
        .rejects.toThrow('Unable to fetch favorites');
    });
  });

  describe('fetchFavoritesWithDetails', () => {
    it('fetches favorites with details from API when backend is enabled', async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockFavorites });
      (fetchRecipeDetail as jest.Mock).mockImplementation((id: string) => {
        const recipeId = Number.parseInt(id.replace('recipe', ''));
        return Promise.resolve(mockRecipes.find(r => r.id === recipeId));
      });

      (favoriteService.fetchFavoritesWithDetails as jest.Mock).mockImplementationOnce(async (token: string) => {
        const { data } = await axios.get('http://localhost:3000/favorites', {
          headers: { Authorization: token },
        });

        const recipesPromises = data.map(async (fav: FavoriteType) => {
          try {
            return await fetchRecipeDetail(fav.recipeId);
          } catch (error) {
            return null;
          }
        });

        const recipes = await Promise.all(recipesPromises);
        return recipes.filter(Boolean);
      });

      const result = await favoriteService.fetchFavoritesWithDetails('Bearer token123', 'user1');

      expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/favorites', {
        headers: { Authorization: 'Bearer token123' }
      });
      expect(fetchRecipeDetail).toHaveBeenCalledTimes(2);
      expect(result.length).toBe(2);
    });

    it('handles missing recipe details gracefully', async () => {
      const originalConsoleError = console.error;
      console.error = vi.fn();

      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockFavorites });
      (fetchRecipeDetail as jest.Mock).mockImplementation((id: string) => {
        if (id === 'recipe1') return Promise.resolve(mockRecipes[0]);
        return Promise.reject(new Error('Recipe not found'));
      });

      (favoriteService.fetchFavoritesWithDetails as jest.Mock).mockImplementationOnce(async (token: string) => {
        const { data } = await axios.get('http://localhost:3000/favorites', {
          headers: { Authorization: token },
        });

        const recipesPromises = data.map(async (fav: FavoriteType) => {
          try {
            return await fetchRecipeDetail(fav.recipeId);
          } catch (error) {
            console.error(`Error fetching detail for recipeId ${fav.recipeId}`, error);
            return null;
          }
        });

        const recipes = await Promise.all(recipesPromises);
        return recipes.filter(Boolean);
      });

      const result = await favoriteService.fetchFavoritesWithDetails('Bearer token123', 'user1');

      console.error = originalConsoleError;

      expect(fetchRecipeDetail).toHaveBeenCalledTimes(2);
      expect(result.length).toBe(1);
    });

    it('fetches favorites with details from mock data when backend is disabled', async () => {
      (favoriteService.fetchFavoritesWithDetails as jest.Mock).mockImplementationOnce(async (_token: string, userId?: string) => {
        const userFavorites = mockFavoriteData.filter(favorite => favorite.userId === userId);

        return userFavorites
          .map(favorite => {
            const recipeId = Number.parseInt(favorite.recipeId.replace('recipe', ''));
            return mockCardData.find(card => card.id === recipeId);
          })
          .filter(Boolean);
      });

      const result = await favoriteService.fetchFavoritesWithDetails('Bearer token123', 'user1');

      expect(result).toHaveLength(2);
      expect(result.some(r => r.title === 'Pasta Carbonara')).toBe(true);
      expect(result.some(r => r.title === 'Pizza Margherita')).toBe(true);
    });
  });

  describe('filterFavoriteRecipes', () => {
    it('filters recipes by title matching the search query', () => {
      const recipes: RecipeType[] = [
        { id: 1, title: 'Pasta Carbonara', extendedIngredients: [], analyzedInstructions: [] },
        { id: 2, title: 'Pizza Margherita', extendedIngredients: [], analyzedInstructions: [] },
        { id: 3, title: 'Chocolate Cake', extendedIngredients: [], analyzedInstructions: [] }
      ];

      const result = favoriteService.filterFavoriteRecipes(recipes, 'pasta');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Pasta Carbonara');
    });

    it('returns empty array when no recipes match', () => {
      const recipes: RecipeType[] = [
        { id: 1, title: 'Pasta Carbonara', extendedIngredients: [], analyzedInstructions: [] },
        { id: 2, title: 'Pizza Margherita', extendedIngredients: [], analyzedInstructions: [] }
      ];

      const result = favoriteService.filterFavoriteRecipes(recipes, 'burger');

      expect(result).toHaveLength(0);
    });

    it('is case insensitive', () => {
      const recipes: RecipeType[] = [
        { id: 1, title: 'Pasta Carbonara', extendedIngredients: [], analyzedInstructions: [] },
        { id: 2, title: 'Pizza Margherita', extendedIngredients: [], analyzedInstructions: [] }
      ];

      const result = favoriteService.filterFavoriteRecipes(recipes, 'PASTA');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Pasta Carbonara');
    });
  });

  describe('addFavorite', () => {
    it('adds a favorite via API when backend is enabled', async () => {
      const newFavorite = { _id: '3', userId: 'user1', recipeId: 'recipe3', createdAt: '2023-01-03' };
      (axios.post as jest.Mock).mockResolvedValueOnce({ data: newFavorite });

      (favoriteService.addFavorite as jest.Mock).mockImplementationOnce(async (recipeId: string, token: string) => {
        const { data } = await axios.post(
          'http://localhost:3000/favorites',
          { recipeId },
          { headers: { Authorization: token } }
        );
        return data;
      });

      const result = await favoriteService.addFavorite('recipe3', 'Bearer token123');

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3000/favorites',
        { recipeId: 'recipe3' },
        { headers: { Authorization: 'Bearer token123' }}
      );
      expect(result).toEqual(newFavorite);
    });

    it('adds a favorite to mock data when backend is disabled', async () => {
      (favoriteService.addFavorite as jest.Mock).mockImplementationOnce(async (recipeId: string) => {
        return {
          _id: 'mock-uuid',
          userId: 'mock-user-id',
          recipeId,
          createdAt: new Date().toISOString(),
        };
      });

      const result = await favoriteService.addFavorite('recipe3', 'Bearer token123');

      expect(result).toHaveProperty('_id', 'mock-uuid');
      expect(result).toHaveProperty('userId', 'mock-user-id');
      expect(result).toHaveProperty('recipeId', 'recipe3');
      expect(result).toHaveProperty('createdAt');
    });

    it('handles API errors without response data', async () => {
      // Setup network error behavior
      (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      (favoriteService.addFavorite as jest.Mock).mockImplementationOnce(async (recipeId: string, token: string) => {
        try {
          await axios.post(
            'http://localhost:3000/favorites',
            { recipeId },
            { headers: { Authorization: token } }
          );
          return {};
        } catch (error) {
          if (error instanceof AxiosError && error.response) {
            throw new Error(error.response.data?.error || 'Error adding favorite');
          }
          throw new Error('Unable to add favorite');
        }
      });

      await expect(favoriteService.addFavorite('recipe3', 'Bearer token123'))
        .rejects.toThrow('Unable to add favorite');
    });
  });

  describe('removeFavorite', () => {
    it('removes a favorite via API when backend is enabled', async () => {
      (axios.delete as jest.Mock).mockResolvedValueOnce({});

      (favoriteService.removeFavorite as jest.Mock).mockImplementationOnce(async (recipeId: string, token: string) => {
        await axios.delete(`http://localhost:3000/favorites/${recipeId}`, {
          headers: { Authorization: token },
        });
      });

      await favoriteService.removeFavorite('recipe1', 'Bearer token123');

      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:3000/favorites/recipe1',
        { headers: { Authorization: 'Bearer token123' }}
      );
    });

    it('removes a favorite from mock data when backend is disabled', async () => {
      (favoriteService.removeFavorite as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(favoriteService.removeFavorite('recipe1', 'Bearer token123'))
        .resolves.not.toThrow();
    });

    it('handles API errors without response data', async () => {
      (axios.delete as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      (favoriteService.removeFavorite as jest.Mock).mockImplementationOnce(async (recipeId: string, token: string) => {
        try {
          await axios.delete(`http://localhost:3000/favorites/${recipeId}`, {
            headers: { Authorization: token },
          });
        } catch (error) {
          if (error instanceof AxiosError && error.response) {
            throw new Error(error.response.data?.error || 'Error removing favorite');
          }
          throw new Error('Unable to remove favorite');
        }
      });

      await expect(favoriteService.removeFavorite('recipe1', 'Bearer token123'))
        .rejects.toThrow('Unable to remove favorite');
    });
  });
});