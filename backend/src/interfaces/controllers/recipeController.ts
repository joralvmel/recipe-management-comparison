import { Request, Response, NextFunction } from 'express';
import { RecipeService } from '@application/services/recipeService';

const recipeService = new RecipeService();

export const searchRecipesController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { query, cuisine, diet, intolerances, mealType, offset, number } = req.query;

    const searchOptions = {
      query: query as string,
      cuisine: cuisine as string,
      diet: diet as string,
      intolerances: intolerances as string,
      mealType: mealType as string,
      offset: offset ? parseInt(offset as string, 10) : undefined,
      number: number ? parseInt(number as string, 10) : undefined,
    };

    const recipes = await recipeService.searchRecipes(searchOptions);
    res.status(200).json(recipes);
  } catch (error) {
    next(error);
  }
};

export const getRecipeDetailController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'Recipe ID is missing' });
      return;
    }
    const recipeDetail = await recipeService.getRecipeDetail(id);
    res.status(200).json(recipeDetail);
  } catch (error: unknown) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error('An unknown error occurred'));
    }
  }
};
