import type { RecipeType, IngredientType } from '@src/types';
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import useRecipeDetail from '@hooks/useRecipeDetail';
import { useParams } from 'react-router-dom';
import { fetchRecipeDetail } from '@services/recipeDetailService';
import { useSnackbar } from '@context/SnackbarContext';

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
}));

vi.mock('@services/recipeDetailService', () => ({
  fetchRecipeDetail: vi.fn(),
}));

vi.mock('@context/SnackbarContext', () => ({
  useSnackbar: vi.fn(),
}));

describe('useRecipeDetail', () => {
  const mockShowSnackbar = vi.fn();

  const mockIngredient: IngredientType = {
    externalId: 1001,
    amount: 100,
    unitShort: 'g',
    nameClean: 'Ingredient 1',
    image: 'ingredient.jpg'
  };

  const mockRecipe: RecipeType = {
    id: 123,
    _id: { $oid: '123abc' },
    title: 'Test Recipe',
    image: 'test-image.jpg',
    readyInMinutes: 30,
    healthScore: 80,
    cuisines: ['Italian'],
    dishTypes: ['main course'],
    diets: ['vegetarian'],
    servings: 2,
    analyzedInstructions: ['Step 1', 'Step 2'],
    extendedIngredients: [mockIngredient]
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (useParams as jest.Mock).mockReturnValue({ id: '123' });
    (useSnackbar as jest.Mock).mockReturnValue({ showSnackbar: mockShowSnackbar });
  });

  it('initializes with correct default values', async () => {
    (fetchRecipeDetail as jest.Mock).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useRecipeDetail());

    expect(result.current.recipe).toBe(null);
    expect(result.current.servings).toBe(1);
  });

  it('fetches recipe on mount', async () => {
    (fetchRecipeDetail as jest.Mock).mockResolvedValue(mockRecipe);

    const { result } = renderHook(() => useRecipeDetail());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchRecipeDetail).toHaveBeenCalledWith('123');
    expect(result.current.recipe).toEqual(mockRecipe);
    expect(result.current.servings).toBe(2);
  });

  it('sets servings from recipe data', async () => {
    const recipeWithServings = { ...mockRecipe, servings: 4 };
    (fetchRecipeDetail as jest.Mock).mockResolvedValue(recipeWithServings);

    const { result } = renderHook(() => useRecipeDetail());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.servings).toBe(4);
  });

  it('handles error when fetching recipe fails', async () => {
    const error = new Error('Failed to fetch recipe');
    (fetchRecipeDetail as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useRecipeDetail());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockShowSnackbar).toHaveBeenCalledWith('Failed to fetch recipe', 'error');
    expect(result.current.recipe).toBe(null);
  });

  it('handles non-Error objects when fetching recipe fails', async () => {
    (fetchRecipeDetail as jest.Mock).mockRejectedValue('string error');

    const { result } = renderHook(() => useRecipeDetail());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockShowSnackbar).toHaveBeenCalledWith('An unexpected error occurred', 'error');
  });

  it('updates servings when handleServingsChange is called', async () => {
    (fetchRecipeDetail as jest.Mock).mockResolvedValue(mockRecipe);

    const { result } = renderHook(() => useRecipeDetail());

    await waitFor(() => expect(result.current.recipe).not.toBe(null));

    act(() => {
      result.current.handleServingsChange(4);
    });

    expect(result.current.servings).toBe(4);
  });

  it('does nothing when id is not provided', async () => {
    (useParams as jest.Mock).mockReturnValue({ id: undefined });
    (fetchRecipeDetail as jest.Mock).mockResolvedValue(mockRecipe);

    renderHook(() => useRecipeDetail());

    await vi.waitFor(() => {
      expect(fetchRecipeDetail).not.toHaveBeenCalled();
    });
  });

  it('refetches recipe when id changes', async () => {
    (fetchRecipeDetail as jest.Mock).mockResolvedValue(mockRecipe);

    const { rerender } = renderHook(() => useRecipeDetail());

    await waitFor(() => expect(fetchRecipeDetail).toHaveBeenCalledWith('123'));

    (fetchRecipeDetail as jest.Mock).mockClear();
    (useParams as jest.Mock).mockReturnValue({ id: '456' });

    rerender();

    await waitFor(() => expect(fetchRecipeDetail).toHaveBeenCalledWith('456'));
  });
});