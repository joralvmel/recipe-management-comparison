import axios from 'axios';
import { RecipeService } from '@application/services/recipeService';
import { RecipeModel } from '@infrastructure/repositories/recipeSchema';
import { RecipeSearchModel } from '@infrastructure/repositories/recipeSearchSchema';
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

  beforeAll(() => {
    jest.spyOn(axios, 'isAxiosError').mockImplementation((error: any) => Boolean(error?.isAxiosError));
  });

  beforeEach(() => {
    recipeService = new RecipeService();
    jest.clearAllMocks();
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
      (RecipeSearchModel.findOne as jest.Mock).mockResolvedValue({ id: 1 });

      const options = { query: 'pasta' };
      const result = await recipeService.searchRecipes(options);

      expect(result).toEqual({
        results: [{ id: 1, title: 'Recipe 1', image: 'image1.jpg' }],
        offset: 0,
        number: 1,
        totalResults: 1,
      });
      expect(RecipeSearchModel.create).not.toHaveBeenCalled();
    });

    it('should append all provided search options to URL', async () => {
      process.env.SPOONACULAR_API_KEY = 'dummy-api-key';
      const options = {
        query: 'pasta',
        cuisine: 'Italian',
        diet: 'vegetarian',
        intolerances: 'gluten',
        mealType: 'dinner',
        offset: 5,
        number: 10,
      };

      const mockResponse = {
        data: {
          results: [{ id: 10, title: 'Recipe 10', image: 'image10.jpg', imageType: 'jpg' }],
          offset: 5,
          number: 10,
          totalResults: 1,
        },
      };
      (axios.get as jest.Mock).mockResolvedValue(mockResponse);
      (toRecipeDTO as jest.Mock).mockReturnValue({ id: 10, title: 'Recipe 10', image: 'image10.jpg' });
      (RecipeSearchModel.findOne as jest.Mock).mockResolvedValue({ id: 10 });

      await recipeService.searchRecipes(options);
      const calledUrl = (axios.get as jest.Mock).mock.calls[0][0];
      expect(calledUrl).toContain('query=pasta');
      expect(calledUrl).toContain('cuisine=Italian');
      expect(calledUrl).toContain('diet=vegetarian');
      expect(calledUrl).toContain('intolerances=gluten');
      expect(calledUrl).toContain('type=dinner');
      expect(calledUrl).toContain('offset=5');
      expect(calledUrl).toContain('number=10');
      expect(calledUrl).toContain('apiKey=dummy-api-key');
    });

    it('should create recipe in RecipeSearchModel if recipe does not exist', async () => {
      const mockResponse = {
        data: {
          results: [{ id: 2, title: 'Recipe 2', image: 'image2.jpg', imageType: 'jpg' }],
          offset: 0,
          number: 1,
          totalResults: 1,
        },
      };
      (axios.get as jest.Mock).mockResolvedValue(mockResponse);
      (toRecipeDTO as jest.Mock).mockReturnValue({ id: 2, title: 'Recipe 2', image: 'image2.jpg' });
      (RecipeSearchModel.findOne as jest.Mock).mockResolvedValue(null);
      (RecipeSearchModel.create as jest.Mock).mockResolvedValue({ id: 2, title: 'Recipe 2', image: 'image2.jpg' });

      const options = { query: 'salad' };
      const result = await recipeService.searchRecipes(options);

      expect(RecipeSearchModel.create).toHaveBeenCalledWith({ id: 2, title: 'Recipe 2', image: 'image2.jpg' });
      expect(result).toEqual({
        results: [{ id: 2, title: 'Recipe 2', image: 'image2.jpg' }],
        offset: 0,
        number: 1,
        totalResults: 1,
      });
    });

    it('should throw ExternalServiceError on axios error in searchRecipes', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        isAxiosError: true,
        response: { status: 500, statusText: 'Internal Server Error' },
      });

      const options = { query: 'pasta' };

      await expect(recipeService.searchRecipes(options)).rejects.toThrow(ExternalServiceError);
    });

    it('should throw ExternalServiceError for non-Axios errors in searchRecipes', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('Generic error'));

      const options = { query: 'pasta' };

      await expect(recipeService.searchRecipes(options)).rejects.toThrow('An unexpected error occurred');
    });

    it('should throw ExternalServiceError on axios error in searchRecipes with no response', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        isAxiosError: true,
      });
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

    it('should process analyzedInstructions and extendedIngredients correctly', async () => {
      (RecipeModel.findOne as jest.Mock).mockResolvedValue(null);
      const mockResponse = {
        data: {
          id: 4,
          title: 'Recipe 4',
          image: 'image4.jpg',
          readyInMinutes: 45,
          healthScore: 90,
          cuisines: ['Italian'],
          dishTypes: ['main course'],
          diets: ['vegan'],
          servings: 4,
          analyzedInstructions: [{ steps: [{ step: 'Step 1' }, { step: 'Step 2' }] }],
          extendedIngredients: [
            {
              id: 10,
              nameClean: 'Tomato',
              measures: { metric: { amount: 200, unitShort: 'g' } },
              image: 'tomato.jpg',
            },
          ],
        },
      };
      (axios.get as jest.Mock).mockResolvedValue(mockResponse);
      (RecipeModel.create as jest.Mock).mockResolvedValue(mockResponse.data);
      (toRecipeDetailDTO as jest.Mock).mockReturnValue({
        id: 4,
        title: 'Recipe 4',
        instructions: ['Step 1', 'Step 2'],
        ingredients: [
          {
            externalId: 10,
            nameClean: 'Tomato',
            amount: 200,
            unitShort: 'g',
            image: 'https://img.spoonacular.com/ingredients_100x100/tomato.jpg',
          },
        ],
      });

      const result = await recipeService.getRecipeDetail('4');
      expect(result).toEqual({
        id: 4,
        title: 'Recipe 4',
        instructions: ['Step 1', 'Step 2'],
        ingredients: [
          {
            externalId: 10,
            nameClean: 'Tomato',
            amount: 200,
            unitShort: 'g',
            image: 'https://img.spoonacular.com/ingredients_100x100/tomato.jpg',
          },
        ],
      });
    });

    it('should return recipe detail with empty instructions and ingredients if externalRecipeData fields are not arrays', async () => {
      (RecipeModel.findOne as jest.Mock).mockResolvedValue(null);
      const mockResponse = {
        data: {
          id: 5,
          title: 'Recipe 5',
          image: 'image5.jpg',
          readyInMinutes: 20,
          healthScore: 50,
          cuisines: null,
          dishTypes: null,
          diets: null,
          servings: 2,
          analyzedInstructions: null,
          extendedIngredients: null,
        },
      };
      (axios.get as jest.Mock).mockResolvedValue(mockResponse);
      (RecipeModel.create as jest.Mock).mockResolvedValue(mockResponse.data);
      (toRecipeDetailDTO as jest.Mock).mockReturnValue({ id: 5, title: 'Recipe 5', instructions: [], ingredients: [] });

      const result = await recipeService.getRecipeDetail('5');
      expect(result).toEqual({ id: 5, title: 'Recipe 5', instructions: [], ingredients: [] });
    });

    it('should throw ResourceNotFoundError if recipe is not found (404) in getRecipeDetail', async () => {
      (RecipeModel.findOne as jest.Mock).mockResolvedValue(null);
      (axios.get as jest.Mock).mockRejectedValue({
        isAxiosError: true,
        response: { status: 404, statusText: 'Not Found' },
      });

      await expect(recipeService.getRecipeDetail('1')).rejects.toThrow(ResourceNotFoundError);
    });

    it('should throw ExternalServiceError on axios error in getRecipeDetail', async () => {
      (RecipeModel.findOne as jest.Mock).mockResolvedValue(null);
      (axios.get as jest.Mock).mockRejectedValue({
        isAxiosError: true,
        response: { status: 500, statusText: 'Internal Server Error' },
      });

      await expect(recipeService.getRecipeDetail('1')).rejects.toThrow(ExternalServiceError);
    });

    it('should throw ExternalServiceError for non-Axios errors in getRecipeDetail', async () => {
      (RecipeModel.findOne as jest.Mock).mockResolvedValue(null);
      (axios.get as jest.Mock).mockRejectedValue(new Error('Generic error'));

      await expect(recipeService.getRecipeDetail('1')).rejects.toThrow('An unexpected error occurred');
    });

    it('should throw ExternalServiceError on axios error in getRecipeDetail with no response', async () => {
      (RecipeModel.findOne as jest.Mock).mockResolvedValue(null);
      (axios.get as jest.Mock).mockRejectedValue({
        isAxiosError: true,
      });
      await expect(recipeService.getRecipeDetail('1')).rejects.toThrow(ExternalServiceError);
    });
  });
});
