import { searchRecipesController, getRecipeDetailController } from '@interfaces/controllers/recipeController';
import { Request, Response, NextFunction } from 'express';
import { searchRecipes } from '@application/usecases/searchRecipes';
import { getRecipeDetail } from '@application/usecases/getRecipeDetail';
import { RecipeSearchDTO } from '@shared/dtos/RecipeDTO';

jest.mock('@application/usecases/searchRecipes');
jest.mock('@application/usecases/getRecipeDetail');

describe('RecipeController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  const setupQueryAndCallController = async (query: any) => {
    req.query = query;
    await searchRecipesController(req as Request, res as Response, next);
  };

  describe('searchRecipesController', () => {
    it('should search recipes and return the results', async () => {
      const recipes = [{ id: '1', title: 'Recipe 1' }];
      (searchRecipes as jest.Mock).mockResolvedValue(recipes);

      await setupQueryAndCallController({
        query: 'pasta',
        cuisine: 'Italian',
        diet: 'vegetarian',
        intolerances: 'gluten',
        mealType: 'dinner',
        offset: '0',
        number: '10',
      });

      expect(searchRecipes).toHaveBeenCalledWith({
        query: 'pasta',
        cuisine: 'Italian',
        diet: 'vegetarian',
        intolerances: 'gluten',
        mealType: 'dinner',
        offset: 0,
        number: 10,
      } as RecipeSearchDTO);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(recipes);
    });

    it('should call next with an error if search fails', async () => {
      const error = new Error('Search failed');
      (searchRecipes as jest.Mock).mockRejectedValue(error);

      await setupQueryAndCallController({
        query: 'pasta',
        cuisine: 'Italian',
        diet: 'vegetarian',
        intolerances: 'gluten',
        mealType: 'dinner',
        offset: '0',
        number: '10',
      });

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call next with an error if query parameter is missing', async () => {
      await setupQueryAndCallController({});

      expect(next).toHaveBeenCalledWith(new Error('Query parameter is missing'));
    });

    it('should use default number value if number parameter is missing or invalid', async () => {
      const recipes = [{ id: '1', title: 'Recipe 1' }];
      (searchRecipes as jest.Mock).mockResolvedValue(recipes);

      await setupQueryAndCallController({
        query: 'pasta',
        cuisine: 'Italian',
        diet: 'vegetarian',
        intolerances: 'gluten',
        mealType: 'dinner',
        offset: '0',
        number: 'invalid',
      });

      expect(searchRecipes).toHaveBeenCalledWith({
        query: 'pasta',
        cuisine: 'Italian',
        diet: 'vegetarian',
        intolerances: 'gluten',
        mealType: 'dinner',
        offset: 0,
        number: 10, // Default value
      } as RecipeSearchDTO);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(recipes);
    });
  });

  describe('getRecipeDetailController', () => {
    it('should get recipe detail and return the result', async () => {
      const recipeDetail = { id: '1', title: 'Recipe 1', ingredients: [] };
      (getRecipeDetail as jest.Mock).mockResolvedValue(recipeDetail);

      req.params = { id: '1' };

      await getRecipeDetailController(req as Request, res as Response, next);

      expect(getRecipeDetail).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(recipeDetail);
    });

    it('should return 400 if recipe ID is missing', async () => {
      req.params = {};

      await getRecipeDetailController(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Recipe ID is missing' });
    });

    it('should call next with an error if getting recipe detail fails', async () => {
      const error = new Error('Get recipe detail failed');
      (getRecipeDetail as jest.Mock).mockRejectedValue(error);

      req.params = { id: '1' };

      await getRecipeDetailController(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call next with an unknown error if an unknown error occurs', async () => {
      const error = 'Unknown error';
      (getRecipeDetail as jest.Mock).mockRejectedValue(error);

      req.params = { id: '1' };

      await getRecipeDetailController(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(new Error('An unknown error occurred'));
    });
  });
});
