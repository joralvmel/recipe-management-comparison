import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import RecipeDetail from '@pages/RecipeDetail';
import '@testing-library/jest-dom';

vi.mock('@components/RecipeMain', () => ({
  default: ({ recipe }: { recipe: { title: string } }) => (
    <div data-testid="recipe-main">
      <h1>{recipe.title}</h1>
    </div>
  ),
}));

vi.mock('@components/RecipeSection', () => ({
  default: ({
              initialServings,
              onServingsChange,
            }: {
    recipe: { title: string };
    initialServings: number;
    onServingsChange: (servings: number) => void;
  }) => (
    <div data-testid="recipe-section">
      <p>{`Servings: ${initialServings}`}</p>
      <button
        type="button"
        data-testid="change-servings"
        onClick={() => onServingsChange(initialServings + 1)}
      >
        Increase Servings
      </button>
    </div>
  ),
}));

vi.mock('@components/ReviewSection', () => ({
  default: ({ recipeId }: { recipeId: string }) => (
    <div data-testid="review-section">
      Review Section for Recipe ID: {recipeId}
    </div>
  ),
}));

vi.mock('@components/Loader', () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="loader">{message}</div>
  ),
}));

const mockUseRecipeDetail = vi.fn();

vi.mock('@hooks/useRecipeDetail', () => ({
  default: () => mockUseRecipeDetail(),
}));

describe('RecipeDetail Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should show the loader when loading is true', () => {
    mockUseRecipeDetail.mockReturnValue({
      recipe: null,
      servings: 0,
      handleServingsChange: vi.fn(),
      loading: true,
    });

    render(<RecipeDetail />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.getByText('Loading recipe details...')).toBeInTheDocument();
  });

  it('should show "Recipe not found" if recipe is null and loading is false', () => {
    mockUseRecipeDetail.mockReturnValue({
      recipe: null,
      servings: 0,
      handleServingsChange: vi.fn(),
      loading: false,
    });

    render(<RecipeDetail />);
    expect(screen.getByText('Recipe not found')).toBeInTheDocument();
  });

  it('should render the RecipeMain, RecipeSection, and ReviewSection components when recipe is available', () => {
    mockUseRecipeDetail.mockReturnValue({
      recipe: { title: 'Test Recipe', externalId: 123 },
      servings: 4,
      handleServingsChange: vi.fn(),
      loading: false,
    });

    render(<RecipeDetail />);
    expect(screen.getByTestId('recipe-main')).toBeInTheDocument();
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-section')).toBeInTheDocument();
    expect(screen.getByText('Servings: 4')).toBeInTheDocument();
    expect(screen.getByTestId('review-section')).toBeInTheDocument();
    expect(screen.getByText('Review Section for Recipe ID: 123')).toBeInTheDocument();
  });

  it('should call handleServingsChange when the servings button is clicked', () => {
    const handleServingsChange = vi.fn();

    mockUseRecipeDetail.mockReturnValue({
      recipe: { title: 'Test Recipe', externalId: 123 },
      servings: 4,
      handleServingsChange,
      loading: false,
    });

    render(<RecipeDetail />);
    const button = screen.getByTestId('change-servings');
    button.click();
    expect(handleServingsChange).toHaveBeenCalledWith(5);
  });
});
