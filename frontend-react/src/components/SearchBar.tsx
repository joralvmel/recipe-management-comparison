import type React from 'react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipeSearch } from '../context/RecipeSearchContext';
import Button from './Button';
import Input from './Input';

interface SearchBarProps {
  placeholder: string;
  value?: string;
  onChange?: (query: string) => void;
  onSearch?: () => void;
  resetSearch?: boolean;
  handleReset?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
                                               placeholder,
                                               value,
                                               onChange,
                                               onSearch,
                                               resetSearch = true,
                                               handleReset,
                                             }) => {
  const navigate = useNavigate();
  const { filters } = useRecipeSearch();
  const currentValue = value !== undefined ? value : '';

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      if (onChange) {
        onChange(query);
      }
    },
    [onChange]
  );

  const handleSearch = useCallback(() => {
    if (onSearch) {
      onSearch();
    } else {
      navigate('/search');
    }
    console.log('Applied search query:', currentValue, 'Filters:', filters);
  }, [onSearch, navigate, currentValue, filters]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
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
      <Button size="medium" type="tertiary" onClick={handleSearch}>
        Search
      </Button>
      {resetSearch && (
        <Button size="medium" type="secondary" onClick={handleReset}>
          Reset
        </Button>
      )}
    </div>
  );
};

export default SearchBar;
