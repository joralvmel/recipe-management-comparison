import type React from 'react';
import Button from './Button';
import Input from './Input';

interface SearchBarProps {
  placeholder: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder }) => {
  return (
    <div className="search-bar">
      <Input type="text" placeholder={placeholder} />
      <Button size="medium" type="tertiary">Search</Button>
    </div>
  );
};

export default SearchBar;
