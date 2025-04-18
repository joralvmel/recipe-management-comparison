import type React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

interface FavoritesSearchContextProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  pageNumber: number;
  setPageNumber: (page: number | ((prev: number) => number)) => void;
  resultsPerPage: number;
  setResultsPerPage: (num: number) => void;
  totalResults: number;
  setTotalResults: (total: number) => void;
  resetPagination: () => void;
}

const FavoritesSearchContext = createContext<FavoritesSearchContextProps | undefined>(undefined);

export const FavoritesSearchProvider: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [totalResults, setTotalResults] = useState(0);

  const resetPagination = useCallback(() => {
    setPageNumber(1);
    setResultsPerPage(10);
  }, []);

  return (
    <FavoritesSearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        pageNumber,
        setPageNumber,
        resultsPerPage,
        setResultsPerPage,
        totalResults,
        setTotalResults,
        resetPagination,
      }}
    >
      {children}
    </FavoritesSearchContext.Provider>
  );
};

export const useFavoritesSearchContext = (): FavoritesSearchContextProps => {
  const context = useContext(FavoritesSearchContext);
  if (!context) {
    throw new Error('useFavoritesSearchContext must be used within a FavoritesSearchProvider');
  }
  return context;
};