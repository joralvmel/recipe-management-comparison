import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { cardData } from '../data/cardData';
import { useRecipeSearch } from '../context/RecipeSearchContext';
import { filters as filterOptions } from '../data/filterData';
import Filters from '../components/Filters';
import Cards from '../components/Cards';
import Pagination from '../components/Pagination';
import '@styles/pages/_search.scss';

const Search: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    filters: globalFilters,
    setFilter,
    setTotalResults,
    pageNumber,
    resultsPerPage,
    resetSearch,
    resetPagination,
  } = useRecipeSearch();

  const [typedQuery, setTypedQuery] = useState(searchQuery);
  const [typedFilters, setTypedFilters] = useState<Record<string, string>>(globalFilters);

  useEffect(() => {
    resetPagination();
  }, [resetPagination]);

  useEffect(() => {
    setTypedQuery(searchQuery);
    setTypedFilters(globalFilters);
  }, [searchQuery, globalFilters]);

  const handleSearch = () => {
    setSearchQuery(typedQuery);
    for (const [id, value] of Object.entries(typedFilters)) {
      setFilter(id, value);
    }
  };

  const handleReset = () => {
    resetSearch();
    setTypedQuery('');
    setTypedFilters({});
  };

  const filteredCards = useMemo(() => {
    return cardData.filter((card) => {
      if (
        searchQuery &&
        !card.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (globalFilters.cuisine && globalFilters.cuisine.trim() !== '') {
        const filterCuisine = globalFilters.cuisine.toLowerCase().trim();
        if (!card.cuisines.some(c => c.toLowerCase().trim().includes(filterCuisine))) {
          return false;
        }
      }
      if (globalFilters['meal-type'] && globalFilters['meal-type'].trim() !== '') {
        const filterMealType = globalFilters['meal-type']
          .toLowerCase()
          .replace(/[-\s]+/g, ' ')
          .trim();
        if (
          !card.dishTypes.some(dt =>
            dt.toLowerCase().replace(/[-\s]+/g, ' ').includes(filterMealType)
          )
        ) {
          return false;
        }
      }
      if (globalFilters.diet && globalFilters.diet.trim() !== '') {
        const filterDiet = globalFilters.diet.toLowerCase().replace(/[-\s]+/g, ' ').trim();
        if (
          !card.diets.some(d =>
            d.toLowerCase().replace(/[-\s]+/g, ' ').includes(filterDiet)
          )
        ) {
          return false;
        }
      }
      return true;
    });
  }, [searchQuery, globalFilters]);

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
        filters={filterOptions}
        searchQuery={typedQuery}
        onSearchQueryChange={setTypedQuery}
        onFiltersChange={(id, value) =>
          setTypedFilters((prev) => ({ ...prev, [id]: value }))
        }
        onSearch={handleSearch}
        handleReset={handleReset}
        filterValues={typedFilters}
      />
      <Cards cards={paginatedCards} />
      <Pagination />
    </div>
  );
};

export default Search;
