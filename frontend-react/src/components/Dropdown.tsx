import type React from 'react';
import { useState, useEffect } from 'react';
import useDropdown from '../hooks/useDropdown.ts';
import '@styles/components/_dropdowns.scss';

interface DropdownProps {
  label: string;
  id: string;
  className?: string;
  options: { value: string; label: string }[];
  direction?: 'up' | 'down';
  onChange?: (value: string) => void;
  value?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
                                             label,
                                             id,
                                             className,
                                             options,
                                             direction = 'down',
                                             onChange,
                                             value,
                                           }) => {
  const { isOpen, toggleDropdown, dropdownRef } = useDropdown();
  const [internalValue, setInternalValue] = useState(options[0].value);
  const selectedValue = value !== undefined ? value : internalValue;

  const selectedOption = options.find(opt => opt.value === selectedValue) || options[0];
  const handleOptionClick = (option: { value: string; label: string }) => {
    if (onChange) {
      onChange(option.value);
    } else {
      setInternalValue(option.value);
    }
    toggleDropdown();
  };

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  return (
    <div className={`filter${className ? ` ${className}` : ''}`} ref={dropdownRef}>
      <label htmlFor={id}>{label}</label>
      <div className="select-wrapper">
        <div
          className={`select${isOpen ? ' open' : ''}`}
          id={id}
          onClick={toggleDropdown}
          onKeyUp={toggleDropdown}
        >
          <div className="select-trigger">
            <span>{selectedOption.label}</span>
            <div className="arrow" />
          </div>
          {isOpen && (
            <ul className={`options ${direction}`}>
              {options.map((option) => (
                <li
                  key={option.value}
                  className={`option${option.value === selectedValue ? ' selected' : ''}`}
                  data-value={option.value}
                  onClick={() => handleOptionClick(option)}
                  onKeyUp={() => handleOptionClick(option)}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
