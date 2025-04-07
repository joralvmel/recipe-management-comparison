import { useState, useRef, useCallback, useEffect } from 'react';

const useDropdown = (initialValue: string, options: { value: string; label: string }[], value?: string) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(initialValue);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  const handleOptionClick = useCallback((option: { value: string; label: string }) => {
    setSelectedValue(option.value);
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (value !== undefined) {
      handleOptionClick({ value, label: options.find(opt => opt.value === value)?.label || '' });
    }
  }, [value, handleOptionClick, options]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  return { isOpen, toggleDropdown, dropdownRef, selectedValue, handleOptionClick };
};

export default useDropdown;
