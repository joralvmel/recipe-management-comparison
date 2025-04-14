import type { FavoriteType } from '../types';
import axios, { AxiosError } from 'axios';

const API_URL = 'http://localhost:3000/favorites';
const useBackend = import.meta.env.VITE_USE_BACKEND === 'true';

export const fetchFavorites = async (token: string): Promise<FavoriteType[]> => {
  if (!useBackend) {
    const { favoriteData } = await import('../data/favoriteData');
    return favoriteData;
  }

  try {
    const { data } = await axios.get<FavoriteType[]>(API_URL, {
      headers: { Authorization: token },
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.message || 'Error fetching favorites');
    }
    throw new Error('Unable to fetch favorites');
  }
};

export const addFavorite = async (recipeId: string, token: string): Promise<FavoriteType> => {
  if (!useBackend) {
    const newFavorite: FavoriteType = {
      _id: crypto.randomUUID(),
      userId: 'mock-user-id',
      recipeId,
      createdAt: new Date().toISOString(),
    };
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
