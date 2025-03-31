import type React from 'react';
import { useState } from 'react';
import useDropdown from '../hooks/useDropdown.ts';
import '@styles/components/_dropdowns.scss';

interface DropdownProps {
  label: string;
  id: string;
  className?: string;
  options: { value: string; label: string }[];
  direction?: 'up' | 'down';
  onChange?: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, id, className, options, direction = 'down', onChange }) => {
  const { isOpen, toggleDropdown, dropdownRef } = useDropdown();
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const handleOptionClick = (option: { value: string; label: string }) => {
    setSelectedOption(option);
    toggleDropdown();
    if (onChange) {
      onChange(option.value);
    }
  };

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
                  className={`option${option.value === selectedOption.value ? ' selected' : ''}`}
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
