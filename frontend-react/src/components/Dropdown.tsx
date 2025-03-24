import type React from 'react';
import '@styles/components/_dropdowns.scss';

interface DropdownProps {
  label: string;
  id: string;
  className?: string;
  options: { value: string; label: string }[];
}

const Dropdown: React.FC<DropdownProps> = ({ label, id, className, options }) => {
  return (
    <div className={`filter${className ? ` ${className}` : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className="select-wrapper">
        <div className="select" id={id}>
          <div className="select-trigger">
            <span>{options[0].label}</span>
            <div className="arrow" />
          </div>
          <ul className="options">
            {options.map((option) => (
              <li key={option.value} className="option" data-value={option.value}>
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
