import { Request, Response, NextFunction } from 'express';
import { RecipeService } from '@application/services/recipeService';

const recipeService = new RecipeService();

export const searchRecipesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { query, cuisine, diet, intolerances, mealType } = req.query;

    const searchOptions = {
      query: query as string,
      cuisine: cuisine as string,
      diet: diet as string,
      intolerances: intolerances as string,
      mealType: mealType as string,
    };

    const recipes = await recipeService.searchRecipes(searchOptions);
    res.status(200).json(recipes);
  } catch (error) {
    next(error);
  }
};
