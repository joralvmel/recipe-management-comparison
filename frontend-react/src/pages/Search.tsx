import type React from 'react';
import { useEffect, useMemo } from 'react';
import { filters } from '../data/filterData';
import { cardData } from '../data/cardData';
import { useRecipeSearch } from '../context/RecipeSearchContext';
import Filters from '../components/Filters';
import Cards from '../components/Cards';
import Pagination from '../components/Pagination';
import '@styles/pages/_search.scss';

const Search: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    setTotalResults,
    pageNumber,
    resultsPerPage,
    setPageNumber,
  } = useRecipeSearch();

  useEffect(() => {
    setPageNumber(1);
  }, [setPageNumber]);

  const filteredCards = useMemo(() => {
    return cardData.filter((card) => {
      if (
        searchQuery &&
        !card.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [searchQuery]);

  useEffect(() => {
    setTotalResults(filteredCards.length);
  }, [filteredCards, setTotalResults]);

  const paginatedCards = useMemo(() => {
    const startIndex = (pageNumber - 1) * resultsPerPage;
    return filteredCards.slice(startIndex, startIndex + resultsPerPage);
  }, [filteredCards, pageNumber, resultsPerPage]);

  return (
    <div className="search container">
      <h1>Search for Recipes</h1>
      <Filters
        filters={filters}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
      <Cards cards={paginatedCards} />
      <Pagination />
    </div>
  );
};

export default Search;
