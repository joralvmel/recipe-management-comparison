import type { RecipeType } from '@src/types';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecipeInfo from '@components/RecipeInfo';

describe('RecipeInfo Component', () => {
  const mockRecipe: RecipeType = {
    readyInMinutes: 30,
    healthScore: 85,
    cuisines: ['Italian', 'Mediterranean'],
    dishTypes: ['Main course', 'Dinner'],
    diets: ['Vegetarian', 'Gluten Free'],
  };

  it('renders preparation time and health score', () => {
    render(<RecipeInfo recipe={mockRecipe} />);

    expect(screen.getByText('Preparation Time')).toBeInTheDocument();
    expect(screen.getByText('30 minutes')).toBeInTheDocument();

    expect(screen.getByText('Health Score')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('renders cuisines correctly', () => {
    render(<RecipeInfo recipe={mockRecipe} />);

    expect(screen.getByText('Cuisines:')).toBeInTheDocument();
    expect(screen.getByText('Italian, Mediterranean')).toBeInTheDocument();
  });

  it('renders dish types correctly', () => {
    render(<RecipeInfo recipe={mockRecipe} />);

    expect(screen.getByText('Dish Types:')).toBeInTheDocument();
    expect(screen.getByText('Main course, Dinner')).toBeInTheDocument();
  });

  it('renders diets correctly', () => {
    render(<RecipeInfo recipe={mockRecipe} />);

    expect(screen.getByText('Diets:')).toBeInTheDocument();
    expect(screen.getByText('Vegetarian, Gluten Free')).toBeInTheDocument();
  });

  it('handles empty recipe fields gracefully', () => {
    const emptyRecipe: RecipeType = {
      readyInMinutes: 0,
      healthScore: 0,
      cuisines: [],
      dishTypes: [],
      diets: [],
    };

    render(<RecipeInfo recipe={emptyRecipe} />);

    expect(screen.getByText('Preparation Time')).toBeInTheDocument();
    expect(screen.getByText('0 minutes')).toBeInTheDocument();

    expect(screen.getByText('Health Score')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();

    const cuisinesLabel = screen.getByText('Cuisines:');
    expect(cuisinesLabel.nextSibling).toBeEmptyDOMElement();

    const dishTypesLabel = screen.getByText('Dish Types:');
    expect(dishTypesLabel.nextSibling).toBeEmptyDOMElement();

    const dietsLabel = screen.getByText('Diets:');
    expect(dietsLabel.nextSibling).toBeEmptyDOMElement();
  });
});
