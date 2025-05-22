import type React from 'react';
import Button from '@components//Button';
import '@styles/components/_inputs.scss';

interface ServingsFilterProps {
  servings: number;
  onServingsChange: (newServings: number) => void;
}

const ServingsFilter: React.FC<ServingsFilterProps> = ({ servings, onServingsChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    const clampedValue = Math.min(Math.max(value, 1), 99);
    onServingsChange(clampedValue);
  };

  const handleIncrement = () => {
    if (servings < 99) {
      onServingsChange(servings + 1);
    }
  };

  const handleDecrement = () => {
    if (servings > 1) {
      onServingsChange(servings - 1);
    }
  };

  return (
    <div className="servings-filter">
      <label htmlFor="servings">Servings:</label>
      <div className="servings-selector">
        <Button size="small" type="primary" htmlType="button" className="decrement" onClick={handleDecrement}>-</Button>
        <input
          className="input-number"
          type="number"
          id="servings"
          value={servings}
          min="1"
          max="99"
          onChange={handleChange}
        />
        <Button size="small" type="primary" htmlType="button" className="increment" onClick={handleIncrement}>+</Button>
      </div>
    </div>
  );
};

export default ServingsFilter;
