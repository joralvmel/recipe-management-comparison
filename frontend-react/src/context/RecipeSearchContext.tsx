import type React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

interface RecipeSearchContextProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: Record<string, string>;
  setFilter: (id: string, value: string) => void;
  pageNumber: number;
  setPageNumber: (page: number | ((prev: number) => number)) => void;
  resultsPerPage: number;
  setResultsPerPage: (num: number) => void;
  totalResults: number;
  setTotalResults: (total: number) => void;
  resetSearch: () => void;
}

const RecipeSearchContext = createContext<RecipeSearchContextProps | undefined>(undefined);

export const RecipeSearchProvider: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pageNumber, setPageNumber] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [totalResults, setTotalResults] = useState(0);

  const setFilter = useCallback((id: string, value: string) => {
    setFilters((prev) => ({ ...prev, [id]: value }));
  }, []);

  const resetSearch = useCallback(() => {
    setSearchQuery('');
    setFilters({});
    setPageNumber(1);
    setResultsPerPage(10);
    setTotalResults(0);
  }, []);

  return (
    <RecipeSearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        filters,
        setFilter,
        pageNumber,
        setPageNumber,
        resultsPerPage,
        setResultsPerPage,
        totalResults,
        setTotalResults,
        resetSearch,
      }}
    >
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
