import type React from 'react';
import { useCallback } from 'react';
import Input from '@components/Input';

interface SearchInputProps {
  placeholder: string;
  value: string;
  onChange: (query: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ placeholder, value, onChange }) => {
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className="search-bar">
      <Input
        inputType="text"
        className="input-text"
        id="favorites-search-input"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default SearchInput;
