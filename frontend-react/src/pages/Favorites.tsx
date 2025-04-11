import type React from 'react';
import useFavoritesSearch from '../hooks/useFavoritesSearch';
import SearchInput from '../components/SearchInput';
import Cards from '../components/Cards';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import '@styles/pages/_favorites.scss';

const Favorites: React.FC = () => {
  const {
    favoritesSearchQuery,
    setFavoritesSearchQuery,
    paginatedFavorites,
    loading,
  } = useFavoritesSearch();

  return (
    <div className="favorites container">
      <h1>Search for Favorite Recipes</h1>
      <SearchInput
        placeholder="Search Favorites"
        value={favoritesSearchQuery}
        onChange={setFavoritesSearchQuery}
      />
      {loading ? (
        <Loader message="Loading favorites..." size="large" />
      ) : (
        <>
          <Cards recipes={paginatedFavorites} />
          <Pagination />
        </>
      )}
    </div>
  );
};

export default Favorites;
