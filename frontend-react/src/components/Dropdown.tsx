import type React from 'react';
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
  const initialValue = value !== undefined ? value : options[0].value;
  const { isOpen, toggleDropdown, dropdownRef, selectedValue, handleOptionClick } = useDropdown(initialValue, options, value);

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
            <span>{options.find(opt => opt.value === selectedValue)?.label}</span>
            <div className="arrow" />
          </div>
          {isOpen && (
            <ul className={`options ${direction}`}>
              {options.map((option) => (
                <li
                  key={option.value}
                  className={`option${option.value === selectedValue ? ' selected' : ''}`}
                  data-value={option.value}
                  onClick={() => {
                    handleOptionClick(option);
                    if (onChange) onChange(option.value);
                  }}
                  onKeyUp={() => {
                    handleOptionClick(option);
                    if (onChange) onChange(option.value);
                  }}
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
