import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import Ingredient from '@components/Ingredient';

vi.mock('@components/Image.tsx', () => ({
  __esModule: true,
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <img data-testid="ingredient-image" src={src} alt={alt} className={className} />
  ),
}));

describe('Ingredient Component', () => {
  const mockIngredient = {
    amount: 2,
    unitShort: 'cups',
    nameClean: 'sugar',
    image: 'sugar.jpg',
    externalId: 12345,
  };

  it('renders the ingredient details correctly', () => {
    render(
      <Ingredient
        ingredient={mockIngredient}
        currentServings={4}
        initialServings={2}
      />
    );

    const ingredientName = screen.getByText(/sugar/i);
    const ingredientAmount = screen.getByText(/4.0/i);
    const ingredientUnit = screen.getByText(/cups/i);
    const ingredientImage = screen.getByTestId('ingredient-image');

    expect(ingredientName).toBeInTheDocument();
    expect(ingredientAmount).toBeInTheDocument();
    expect(ingredientUnit).toBeInTheDocument();
    expect(ingredientImage).toHaveAttribute('src', 'sugar.jpg');
    expect(ingredientImage).toHaveAttribute('alt', 'sugar');
  });

  it('calculates the ingredient amount correctly based on servings', () => {
    render(
      <Ingredient
        ingredient={mockIngredient}
        currentServings={3}
        initialServings={2}
      />
    );

    const ingredientAmount = screen.getByText(/3.0/i);
    expect(ingredientAmount).toBeInTheDocument();
  });

  it('renders the ingredient image with correct attributes', () => {
    render(
      <Ingredient
        ingredient={mockIngredient}
        currentServings={2}
        initialServings={2}
      />
    );

    const ingredientImage = screen.getByTestId('ingredient-image');
    expect(ingredientImage).toHaveAttribute('src', 'sugar.jpg');
    expect(ingredientImage).toHaveAttribute('alt', 'sugar');
    expect(ingredientImage).toHaveClass('ingredient-image');
  });
});