import type { RecipeType } from '@src/types';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Card from '@components/Card';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

vi.mock('@components/Image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img data-testid="image" src={src} alt={alt} />
  ),
}));

vi.mock('@components/Favorite', () => ({
  default: ({ id }: { id: string }) => (
    <button type="button" data-testid="favorite" data-recipe-id={id}>
      Favorite
    </button>
  ),
}));

describe('Card Component', () => {
  const mockRecipe: RecipeType = {
    id: 123,
    image: 'https://example.com/image.jpg',
    title: 'Test Recipe',
    readyInMinutes: 30,
    healthScore: 85,
    externalId: undefined,
  };

  it('should render the Card component with the provided recipe data', () => {
    render(
      <MemoryRouter>
        <Card recipe={mockRecipe} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/recipe/123');
    expect(screen.getByTestId('image')).toHaveAttribute('src', mockRecipe.image);
    expect(screen.getByTestId('image')).toHaveAttribute('alt', mockRecipe.title);
    if (mockRecipe.title) {
      expect(screen.getByText(mockRecipe.title)).toBeInTheDocument();
    }
    expect(screen.getByText(/preparation time: 30/i)).toBeInTheDocument();
    expect(screen.getByText(/score: 85/i)).toBeInTheDocument();
    expect(screen.getByTestId('favorite')).toHaveAttribute('data-recipe-id', '123');
  });

  it('should not render anything if recipeId is missing', () => {
    const incompleteRecipe = { ...mockRecipe, id: undefined, externalId: undefined };
    const { container } = render(
      <MemoryRouter>
        <Card recipe={incompleteRecipe as RecipeType} />
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should use externalId as a fallback for recipeId', () => {
    const externalRecipe = { ...mockRecipe, id: undefined, externalId: 456 };
    render(
      <MemoryRouter>
        <Card recipe={externalRecipe as RecipeType} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/recipe/456');
    expect(screen.getByTestId('favorite')).toHaveAttribute('data-recipe-id', '456');
  });

  it('should render default values when certain recipe properties are missing', () => {
    vi.mock('@components/Image', () => ({
      default: ({ src, alt }: { src: string; alt: string }) => (
        <img
          data-testid="image"
          src={src || 'https://via.placeholder.com/150'}
          alt={alt || 'Recipe image'}
        />
      ),
    }));

    const minimalRecipe: RecipeType = { id: 789, image: '', title: '', readyInMinutes: 0, healthScore: 0 };
    render(
      <MemoryRouter>
        <Card recipe={minimalRecipe} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/recipe/789');
    expect(screen.getByTestId('image')).toHaveAttribute('src', 'https://via.placeholder.com/150');
    expect(screen.getByTestId('image')).toHaveAttribute('alt', 'Recipe image');
    expect(screen.getByText(/preparation time: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/score: 0/i)).toBeInTheDocument();
    expect(screen.getByTestId('favorite')).toHaveAttribute('data-recipe-id', '789');
  });
});