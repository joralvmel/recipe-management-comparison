import type React from 'react';

interface ServingsFilterProps {
  servings: number;
  onServingsChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ServingsFilter: React.FC<ServingsFilterProps> = ({ servings, onServingsChange }) => {
  return (
    <div className="servings-filter">
      <label htmlFor="servings">Servings:</label>
      <div className="servings-selector">
        <button type="button" className="primary-button small-button decrement">-</button>
        <input
          className="input-number"
          type="number"
          id="servings"
          value={servings}
          min="1"
          max="6"
          onChange={onServingsChange}
        />
        <button type="button" className="primary-button small-button increment">+</button>
      </div>
    </div>
  );
};

export default ServingsFilter;
