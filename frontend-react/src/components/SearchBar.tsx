import type React from 'react';
import { useCallback } from 'react';
import Button from './Button';
import Input from './Input';
import { useNavigate } from 'react-router-dom';
import { useRecipeSearch } from '../context/RecipeSearchContext';

interface SearchBarProps {
  placeholder: string;
  value?: string;
  onChange?: (query: string) => void;
  onSearch?: () => void;
  autoSearch?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
                                               placeholder,
                                               value,
                                               onChange,
                                               onSearch,
                                               autoSearch = false,
                                             }) => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, filters } = useRecipeSearch();
  const currentValue = value !== undefined ? value : searchQuery;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      if (onChange) {
        onChange(query);
      } else {
        setSearchQuery(query);
      }
    },
    [onChange, setSearchQuery]
  );

  const handleSearch = useCallback(() => {
    if (onSearch) {
      onSearch();
    } else {
      navigate('/search');
    }
    console.log('Search query:', currentValue, 'Filters:', filters);
  }, [onSearch, navigate, currentValue, filters]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!autoSearch && e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-bar">
      <Input
        inputType="text"
        className="input-text"
        id="search-input"
        placeholder={placeholder}
        value={currentValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      {!autoSearch && (
        <Button size="medium" type="tertiary" onClick={handleSearch}>
          Search
        </Button>
      )}
    </div>
  );
};

export default SearchBar;
