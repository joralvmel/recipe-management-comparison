import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import IngredientsList from '@components/IngredientsList';

vi.mock('@components/Ingredient', () => ({
  __esModule: true,
  default: ({
              ingredient,
              currentServings,
              initialServings,
            }: {
    ingredient: { nameClean: string; externalId: number };
    currentServings: number;
    initialServings: number;
  }) => (
    <li data-testid="ingredient-item" data-external-id={ingredient.externalId}>
      {ingredient.nameClean} ({currentServings}/{initialServings})
    </li>
  ),
}));

describe('IngredientsList Component', () => {
  const mockIngredients = [
    {
      externalId: 1,
      nameClean: 'sugar',
      amount: 2,
      unitShort: 'cups',
      image: 'sugar.jpg',
    },
    {
      externalId: 2,
      nameClean: 'flour',
      amount: 3,
      unitShort: 'cups',
      image: 'flour.jpg',
    },
  ];

  it('renders the label for ingredients', () => {
    render(
      <IngredientsList
        ingredients={mockIngredients}
        currentServings={4}
        initialServings={2}
      />
    );

    const label = screen.getByText('Ingredients');
    expect(label).toBeInTheDocument();
  });

  it('renders the correct number of ingredients', () => {
    render(
      <IngredientsList
        ingredients={mockIngredients}
        currentServings={4}
        initialServings={2}
      />
    );

    const ingredientItems = screen.getAllByTestId('ingredient-item');
    expect(ingredientItems).toHaveLength(mockIngredients.length);
  });

  it('passes the correct props to each Ingredient component', () => {
    render(
      <IngredientsList
        ingredients={mockIngredients}
        currentServings={4}
        initialServings={2}
      />
    );

    const ingredientItems = screen.getAllByTestId('ingredient-item');

    ingredientItems.forEach((item, index) => {
      const ingredient = mockIngredients[index];
      expect(item).toHaveAttribute('data-external-id', ingredient.externalId.toString());
      expect(item).toHaveTextContent(`${ingredient.nameClean} (4/2)`);
    });
  });
});
