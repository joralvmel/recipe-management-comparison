import type React from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fetchFavorites, addFavorite, removeFavorite } from '../services/favoriteService';
import { useAuth } from './AuthContext';

interface FavoriteContextProps {
  favorites: Record<string, boolean>;
  loadFavorites: () => Promise<void>;
  addToFavorites: (recipeId: string) => Promise<void>;
  removeFromFavorites: (recipeId: string) => Promise<void>;
  isFavorite: (recipeId: string) => boolean;
}

const FavoriteContext = createContext<FavoriteContextProps | undefined>(undefined);

export const FavoriteProvider: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({ children }) => {
  const { user, isSignedIn } = useAuth();
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const token = user?.token ? `Bearer ${user.token}` : '';

  const loadFavorites = useCallback(async () => {
    if (!isSignedIn || !token) return;
    try {
      const favoriteList = await fetchFavorites(token);
      const favoriteMap = favoriteList.reduce((acc, fav) => {
        acc[fav.recipeId] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setFavorites(favoriteMap);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  }, [isSignedIn, token]);

  const addToFavorites = useCallback(
    async (recipeId: string) => {
      if (!isSignedIn || !token) return;
      try {
        const newFavorite = await addFavorite(recipeId, token);
        setFavorites((prev) => ({ ...prev, [newFavorite.recipeId]: true }));
      } catch (error) {
        console.error('Failed to add favorite:', error);
      }
    },
    [isSignedIn, token]
  );

  const removeFromFavorites = useCallback(
    async (recipeId: string) => {
      if (!isSignedIn || !token) return;
      try {
        await removeFavorite(recipeId, token);
        setFavorites((prev) => {
          const updated = { ...prev };
          delete updated[recipeId];
          return updated;
        });
      } catch (error) {
        console.error('Failed to remove favorite:', error);
      }
    },
    [isSignedIn, token]
  );

  const isFavorite = useCallback(
    (recipeId: string) => !!favorites[recipeId],
    [favorites]
  );

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        loadFavorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavoriteContext = (): FavoriteContextProps => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavoriteContext must be used within a FavoriteProvider');
  }
  return context;
};
