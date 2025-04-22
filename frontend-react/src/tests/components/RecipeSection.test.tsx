import type { RecipeType } from '@src/types';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import RecipeSection from '@components/RecipeSection';

vi.mock('@components/ServingsFilter', () => ({
  __esModule: true,
  default: ({
              servings,
              onServingsChange,
            }: {
    servings: number;
    onServingsChange: (newServings: number) => void;
  }) => (
    <div>
      <span data-testid="servings-filter">Servings: {servings}</span>
      <button
        type="button"
        data-testid="increase-servings"
        onClick={() => onServingsChange(servings + 1)}
      >
        Increase
      </button>
    </div>
  ),
}));

vi.mock('@components/IngredientsList', () => ({
  __esModule: true,
  default: ({
              ingredients,
              currentServings,
              initialServings,
            }: {
    ingredients: { externalId: number; amount: number; unitShort: string; nameClean: string }[];
    currentServings: number;
    initialServings: number;
  }) => (
    <div data-testid="ingredients-list">
      Ingredients for {currentServings} servings (initially {initialServings} servings):
      {ingredients.map((ingredient) => (
        <div key={ingredient.externalId} data-testid="ingredient">
          {ingredient.amount} {ingredient.unitShort} {ingredient.nameClean}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@components/RecipeInfo', () => ({
  __esModule: true,
  default: ({ recipe }: { recipe: RecipeType }) => (
    <div data-testid="recipe-info">Recipe Info for {recipe.title}</div>
  ),
}));

vi.mock('@components/RecipeInstructions', () => ({
  __esModule: true,
  default: ({ instructions }: { instructions: string[] }) => (
    <div data-testid="recipe-instructions">
      Instructions:
      <ol>
        {instructions.map((instruction) => (
          <li key={instruction} data-testid="instruction">
            {instruction}
          </li>
        ))}
      </ol>
    </div>
  ),
}));

describe('RecipeSection Component', () => {
  const mockRecipe: RecipeType = {
    title: 'Delicious Recipe',
    servings: 4,
    extendedIngredients: [
      { externalId: 1, amount: 1, unitShort: 'cup', nameClean: 'flour', image: 'flour.png' },
      { externalId: 2, amount: 2, unitShort: '', nameClean: 'eggs', image: 'eggs.png' },
      { externalId: 3, amount: 0.5, unitShort: 'cup', nameClean: 'sugar', image: 'sugar.png' },
    ],
    analyzedInstructions: ['Mix ingredients', 'Bake at 350°F for 25 minutes'],
  };

  const mockOnServingsChange = vi.fn();

  it('renders the ServingsFilter component with correct initial servings', () => {
    render(
      <RecipeSection
        recipe={mockRecipe}
        initialServings={mockRecipe.servings || 1}
        onServingsChange={mockOnServingsChange}
      />
    );

    expect(screen.getByTestId('servings-filter')).toHaveTextContent(
      `Servings: ${mockRecipe.servings}`
    );
  });

  it('calls onServingsChange when servings are updated', () => {
    render(
      <RecipeSection
        recipe={mockRecipe}
        initialServings={mockRecipe.servings || 1}
        onServingsChange={mockOnServingsChange}
      />
    );

    const increaseButton = screen.getByTestId('increase-servings');
    fireEvent.click(increaseButton);

    expect(mockOnServingsChange).toHaveBeenCalledWith((mockRecipe.servings || 0) + 1);
  });

  it('renders the IngredientsList component with correct data', () => {
    render(
      <RecipeSection
        recipe={mockRecipe}
        initialServings={mockRecipe.servings || 1}
        onServingsChange={mockOnServingsChange}
      />
    );

    expect(screen.getByTestId('ingredients-list')).toHaveTextContent(
      `Ingredients for ${mockRecipe.servings} servings (initially ${mockRecipe.servings} servings):`
    );

    const ingredientElements = screen.getAllByTestId('ingredient');
    expect(ingredientElements).toHaveLength(mockRecipe.extendedIngredients?.length ?? 0);

    mockRecipe.extendedIngredients?.forEach((ingredient, index) => {
      const expectedText = `${ingredient.amount} ${ingredient.unitShort} ${ingredient.nameClean}`.replace(/\s+/g, ' ').trim();
      const actualText = ingredientElements[index]?.textContent?.replace(/\s+/g, ' ').trim();
      expect(actualText).toBe(expectedText);
    });
  });

  it('renders the RecipeInfo component with correct data', () => {
    render(
      <RecipeSection
        recipe={mockRecipe}
        initialServings={mockRecipe.servings || 1}
        onServingsChange={mockOnServingsChange}
      />
    );

    expect(screen.getByTestId('recipe-info')).toHaveTextContent(
      `Recipe Info for ${mockRecipe.title}`
    );
  });

  it('renders the RecipeInstructions component with correct instructions', () => {
    render(
      <RecipeSection
        recipe={mockRecipe}
        initialServings={mockRecipe.servings || 1}
        onServingsChange={mockOnServingsChange}
      />
    );

    expect(screen.getByTestId('recipe-instructions')).toBeInTheDocument();
    for (const instruction of mockRecipe.analyzedInstructions || []) {
      expect(screen.getByText(instruction)).toBeInTheDocument();
    }
  });

  it('handles empty ingredients and instructions gracefully', () => {
    const emptyRecipe: RecipeType = {
      ...mockRecipe,
      extendedIngredients: [],
      analyzedInstructions: [],
    };

    render(
      <RecipeSection
        recipe={emptyRecipe}
        initialServings={emptyRecipe.servings || 1}
        onServingsChange={mockOnServingsChange}
      />
    );

    expect(screen.getByTestId('ingredients-list')).toHaveTextContent(
      `Ingredients for ${emptyRecipe.servings} servings (initially ${emptyRecipe.servings} servings):`
    );
    expect(screen.queryAllByTestId('ingredient')).toHaveLength(0);

    expect(screen.getByTestId('recipe-instructions')).toHaveTextContent('Instructions:');
    expect(screen.queryAllByTestId('instruction')).toHaveLength(0);
  });
});