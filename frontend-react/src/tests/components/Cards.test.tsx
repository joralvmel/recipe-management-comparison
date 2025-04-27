import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Cards from '@components/Cards';
import '@testing-library/jest-dom';
import type { RecipeType } from '@src/types';

vi.mock('@components/Card', () => ({
  default: vi.fn(({ recipe }: { recipe: RecipeType }) => (
    <div data-testid="card" data-key={recipe.id}>
      {recipe.title && <span>{recipe.title}</span>}
    </div>
  )),
}));

vi.mock('@hooks/useLazyLoad', () => ({
  default: vi.fn(() => [true, { current: null }]),
}));

describe('Cards Component', () => {
  const mockRecipes: RecipeType[] = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: `Recipe ${i + 1}`,
    image: `https://example.com/image-${i + 1}.jpg`,
    readyInMinutes: 10 + i,
    healthScore: 50 + i,
    externalId: undefined,
  }));

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders all recipes directly without lazy loading if recipes <= 10', () => {
    render(<Cards recipes={mockRecipes} />);

    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(mockRecipes.length);

    mockRecipes.forEach((recipe, index) => {
      expect(cards[index]).toHaveTextContent(recipe.title || '');
    });
  });

  it('renders recipes with lazy loading if recipes > 10', () => {
    const largeMockRecipes: RecipeType[] = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      title: `Recipe ${i + 1}`,
      image: `https://example.com/image-${i + 1}.jpg`,
      readyInMinutes: 10 + i,
      healthScore: 50 + i,
      externalId: undefined,
    }));

    render(<Cards recipes={largeMockRecipes} />);

    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(largeMockRecipes.length);

    largeMockRecipes.forEach((recipe, index) => {
      expect(cards[index]).toHaveTextContent(recipe.title || '');
    });
  });

  it('uses unique keys for recipes', () => {
    render(<Cards recipes={mockRecipes} />);

    const cardElements = screen.getAllByTestId('card');
    const keys = cardElements.map((card) => card.getAttribute('data-key'));

    expect(keys).toHaveLength(mockRecipes.length);
    expect(new Set(keys).size).toBe(mockRecipes.length);
  });
});
