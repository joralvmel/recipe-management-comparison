import axios, { AxiosError } from 'axios';
import type { RecipeType, FavoriteType } from '@src/types';
import { fetchRecipeDetail } from '@services/recipeDetailService';

const API_URL = `${import.meta.env.VITE_API_URL}/favorites`;
const useBackend = import.meta.env.VITE_USE_BACKEND === 'true';

export const fetchFavorites = async (token: string, authenticatedUserId?: string): Promise<FavoriteType[]> => {
  if (!useBackend) {
    const { favoriteData } = await import('@src/data/favoriteData');

    return favoriteData.filter((favorite) => favorite.userId === authenticatedUserId);
  }

  try {
    const { data } = await axios.get<FavoriteType[]>(API_URL, {
      headers: { Authorization: token },
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.message || 'Error fetching favorite data');
    }
    throw new Error('Unable to fetch favorites');
  }
};

export const fetchFavoritesWithDetails = async (token: string, authenticatedUserId?: string): Promise<RecipeType[]> => {
  if (!useBackend) {
    const { favoriteData } = await import('@src/data/favoriteData');
    const { cardData } = await import('@src/data/cardData');
    const userFavorites = favoriteData.filter((favorite) => favorite.userId === authenticatedUserId);

    return userFavorites
      .map((favorite) =>
        cardData.find((card) => card.id !== undefined && card.id.toString() === favorite.recipeId)
      )
      .filter((recipe): recipe is RecipeType => recipe !== undefined);
  }

  try {
    const favoritesData = await fetchFavorites(token, authenticatedUserId);
    const recipesResponse = await Promise.all(
      favoritesData.map(async (fav) => {
        try {
          return await fetchRecipeDetail(fav.recipeId);
        } catch (error) {
          console.error(`Error fetching detail for recipeId ${fav.recipeId}`, error);
          return null;
        }
      })
    );

    return recipesResponse.filter((recipe): recipe is RecipeType => recipe !== null);
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.message || 'Error fetching favorites');
    }
    throw new Error('Unable to fetch favorites');
  }
};

export const filterFavoriteRecipes = (
  recipes: RecipeType[],
  searchQuery: string
): RecipeType[] => {
  return recipes.filter((recipe) =>
    recipe.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

export const addFavorite = async (recipeId: string, token: string): Promise<FavoriteType> => {
  if (!useBackend) {
    const mockUserId = 'mock-user-id';
    const newFavorite: FavoriteType = {
      _id: crypto.randomUUID(),
      userId: mockUserId,
      recipeId,
      createdAt: new Date().toISOString(),
    };

    const { favoriteData } = await import('@src/data/favoriteData');
    favoriteData.push(newFavorite);

    return newFavorite;
  }

  try {
    const { data } = await axios.post<FavoriteType>(
      API_URL,
      { recipeId },
      { headers: { Authorization: token } }
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.error || 'Error adding favorite');
    }
    throw new Error('Unable to add favorite');
  }
};

export const removeFavorite = async (recipeId: string, token: string): Promise<void> => {
  if (!useBackend) {
    const { favoriteData } = await import('@src/data/favoriteData');
    const index = favoriteData.findIndex((fav) => fav.recipeId === recipeId && fav.userId === 'mock-user-id');
    if (index !== -1) {
      favoriteData.splice(index, 1);
    }
    return;
  }

  try {
    await axios.delete(`${API_URL}/${recipeId}`, {
      headers: { Authorization: token },
    });
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.error || 'Error removing favorite');
    }
    throw new Error('Unable to remove favorite');
  }
};
