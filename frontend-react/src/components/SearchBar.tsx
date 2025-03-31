import type React from 'react';
import { useCallback } from 'react';
import Button from './Button';
import Input from './Input';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';

interface SearchBarProps {
  placeholder: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder }) => {
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery]
  );

  const handleSearch = useCallback(() => {
    navigate('/search');
    console.log('Search query:', searchQuery);
  }, [navigate, searchQuery]);

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
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <Button size="medium" type="tertiary" onClick={handleSearch}>
        Search
      </Button>
    </div>
  );
};

export default SearchBar;
