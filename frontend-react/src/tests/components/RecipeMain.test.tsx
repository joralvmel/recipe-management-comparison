import type { RecipeType } from '@src/types';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import RecipeMain from '@components/RecipeMain';

vi.mock('@components/Favorite', () => ({
  __esModule: true,
  default: ({ id }: { id: string }) => <div data-testid="favorite">Favorite Component for ID: {id}</div>,
}));

vi.mock('@components/Image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string | null; alt: string }) => (
    <img src={src || undefined} alt={alt} data-testid="recipe-image" />
  ),
}));

describe('RecipeMain Component', () => {
  const mockRecipe: RecipeType = {
    externalId: 12345,
    image: 'https://example.com/recipe.jpg',
    title: 'Delicious Recipe',
  };

  it('renders the recipe title', () => {
    render(<RecipeMain recipe={mockRecipe} />);

    expect(screen.getByText('Delicious Recipe')).toBeInTheDocument();
  });

  it('renders "Untitled Recipe" if title is missing', () => {
    const recipeWithoutTitle: RecipeType = { ...mockRecipe, title: undefined };

    render(<RecipeMain recipe={recipeWithoutTitle} />);

    expect(screen.getByText('Untitled Recipe')).toBeInTheDocument();
  });

  it('renders the Favorite component if externalId is provided', () => {
    render(<RecipeMain recipe={mockRecipe} />);

    const favoriteComponent = screen.getByTestId('favorite');
    expect(favoriteComponent).toBeInTheDocument();
    expect(favoriteComponent).toHaveTextContent('Favorite Component for ID: 12345');
  });

  it('does not render the Favorite component if externalId is missing', () => {
    const recipeWithoutExternalId: RecipeType = { ...mockRecipe, externalId: undefined };

    render(<RecipeMain recipe={recipeWithoutExternalId} />);

    expect(screen.queryByTestId('favorite')).not.toBeInTheDocument();
  });

  it('renders the Image component with correct src and alt attributes', () => {
    render(<RecipeMain recipe={mockRecipe} />);

    const recipeImage = screen.getByTestId('recipe-image');
    expect(recipeImage).toBeInTheDocument();
    expect(recipeImage).toHaveAttribute('src', 'https://example.com/recipe.jpg');
    expect(recipeImage).toHaveAttribute('alt', 'Delicious Recipe');
  });

  it('does not set the src attribute if image is missing', () => {
    const recipeWithoutImage: RecipeType = { ...mockRecipe, image: undefined, title: undefined };

    render(<RecipeMain recipe={recipeWithoutImage} />);

    const recipeImage = screen.getByTestId('recipe-image');
    expect(recipeImage).toBeInTheDocument();
    expect(recipeImage).not.toHaveAttribute('src'); // Ensures src is omitted
    expect(recipeImage).toHaveAttribute('alt', 'Recipe Image');
  });
});