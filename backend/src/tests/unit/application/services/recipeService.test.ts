import axios from 'axios';
import { RecipeService } from '@application/services/recipeService';
import { RecipeModel } from '@infrastructure/repositories/recipeSchema';
import { ResourceNotFoundError, ExternalServiceError } from '@shared/errors/customErrors';
import { toRecipeDTO } from '@shared/mappers/RecipeMapper';
import { toRecipeDetailDTO } from '@shared/mappers/RecipeDetailMapper';

jest.mock('axios');
jest.mock('@infrastructure/repositories/recipeSchema');
jest.mock('@infrastructure/repositories/recipeSearchSchema');
jest.mock('@shared/mappers/RecipeMapper');
jest.mock('@shared/mappers/RecipeDetailMapper');

describe('RecipeService', () => {
  let recipeService: RecipeService;

  beforeEach(() => {
    recipeService = new RecipeService();
  });

  describe('searchRecipes', () => {
    it('should return search results', async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, title: 'Recipe 1', image: 'image1.jpg', imageType: 'jpg' }],
          offset: 0,
          number: 1,
          totalResults: 1,
        },
      };
      (axios.get as jest.Mock).mockResolvedValue(mockResponse);
      (toRecipeDTO as jest.Mock).mockReturnValue({ id: 1, title: 'Recipe 1', image: 'image1.jpg' });

      const options = { query: 'pasta' };
      const result = await recipeService.searchRecipes(options);

      expect(result).toEqual({
        results: [{ id: 1, title: 'Recipe 1', image: 'image1.jpg' }],
        offset: 0,
        number: 1,
        totalResults: 1,
      });
    });

    it('should throw ExternalServiceError on axios error', async () => {
      (axios.get as jest.Mock).mockRejectedValue({ response: { status: 500, statusText: 'Internal Server Error' } });

      const options = { query: 'pasta' };

      await expect(recipeService.searchRecipes(options)).rejects.toThrow(ExternalServiceError);
    });
  });

  describe('getRecipeDetail', () => {
    it('should return recipe detail if found in database', async () => {
      const mockRecipe = { externalId: 1, title: 'Recipe 1' };
      (RecipeModel.findOne as jest.Mock).mockResolvedValue(mockRecipe);
      (toRecipeDetailDTO as jest.Mock).mockReturnValue({ id: 1, title: 'Recipe 1' });

      const result = await recipeService.getRecipeDetail('1');

      expect(result).toEqual({ id: 1, title: 'Recipe 1' });
    });

    it('should fetch and save recipe detail if not found in database', async () => {
      (RecipeModel.findOne as jest.Mock).mockResolvedValue(null);
      const mockResponse = {
        data: {
          id: 1,
          title: 'Recipe 1',
          image: 'image1.jpg',
          readyInMinutes: 30,
          healthScore: 80,
          cuisines: [],
          dishTypes: [],
          diets: [],
          servings: 4,
          analyzedInstructions: [],
          extendedIngredients: [],
        },
      };
      (axios.get as jest.Mock).mockResolvedValue(mockResponse);
      (RecipeModel.create as jest.Mock).mockResolvedValue(mockResponse.data);
      (toRecipeDetailDTO as jest.Mock).mockReturnValue({ id: 1, title: 'Recipe 1' });

      const result = await recipeService.getRecipeDetail('1');

      expect(result).toEqual({ id: 1, title: 'Recipe 1' });
    });

    it('should throw ResourceNotFoundError if recipe is not found', async () => {
      (RecipeModel.findOne as jest.Mock).mockResolvedValue(null);
      (axios.get as jest.Mock).mockRejectedValue({
        isAxiosError: true,
        response: { status: 404, statusText: 'Not Found' },
      });

      await expect(recipeService.getRecipeDetail('1')).rejects.toThrow(ResourceNotFoundError);
    });

    it('should throw ExternalServiceError on axios error', async () => {
      (RecipeModel.findOne as jest.Mock).mockResolvedValue(null);
      (axios.get as jest.Mock).mockRejectedValue({ response: { status: 500, statusText: 'Internal Server Error' } });

      await expect(recipeService.getRecipeDetail('1')).rejects.toThrow(ExternalServiceError);
    });
  });
});
