import type React from 'react';
import Button from './Button';

interface ServingsFilterProps {
  servings: number;
  onServingsChange: (newServings: number) => void;
}

const ServingsFilter: React.FC<ServingsFilterProps> = ({ servings, onServingsChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onServingsChange(Number(event.target.value));
  };

  return (
    <div className="servings-filter">
      <label htmlFor="servings">Servings:</label>
      <div className="servings-selector">
        <Button size="small" type="primary" htmlType="button" className="decrement">-</Button>
        <input
          className="input-number"
          type="number"
          id="servings"
          value={servings}
          min="1"
          max="6"
          onChange={handleChange}
        />
        <Button size="small" type="primary" htmlType="button" className="increment">+</Button>
      </div>
    </div>
  );
};

export default ServingsFilter;
