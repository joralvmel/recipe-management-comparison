import type React from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { favoriteData } from '../data/favoriteData';
import { useAuth } from './AuthContext';

interface FavoriteContextProps {
  favorites: Record<string, boolean>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  resetFavorites: () => void;
}

const FavoriteContext = createContext<FavoriteContextProps | undefined>(undefined);

export const FavoriteProvider: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      const initialFavorites = favoriteData.reduce((acc, fav) => {
        if (fav.userId === user.id) {
          acc[fav.recipeId] = true;
        }
        return acc;
      }, {} as Record<string, boolean>);
      setFavorites(initialFavorites);
    } else {
      setFavorites({});
    }
  }, [user]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const isFavorite = useCallback((id: string) => {
    return favorites[id];
  }, [favorites]);

  const resetFavorites = useCallback(() => {
    setFavorites({});
  }, []);

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite, resetFavorites }}>
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = (): FavoriteContextProps => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoriteProvider");
  }
  return context;
};
