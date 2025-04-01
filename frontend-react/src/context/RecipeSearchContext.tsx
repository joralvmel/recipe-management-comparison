import type React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

interface RecipeSearchContextProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  resetSearch: () => void;
}

const RecipeSearchContext = createContext<RecipeSearchContextProps | undefined>(undefined);

export const RecipeSearchProvider: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const resetSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return (
    <RecipeSearchContext.Provider value={{ searchQuery, setSearchQuery, resetSearch }}>
      {children}
    </RecipeSearchContext.Provider>
  );
};

export const useRecipeSearch = (): RecipeSearchContextProps => {
  const context = useContext(RecipeSearchContext);
  if (!context) {
    throw new Error("useRecipeSearch must be used within a RecipeSearchProvider");
  }
  return context;
};
