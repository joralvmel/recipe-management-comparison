import { Request, Response, NextFunction } from 'express';
import { RecipeService } from '@application/services/recipeService';

const recipeService = new RecipeService();

export const searchRecipesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { query } = req.query;
    if (!query) {
      res.status(400).json({ error: 'Missing search parameter "query"' });
      return;
    }
    const recipes = await recipeService.searchRecipes(String(query));
    res.status(200).json(recipes);
  } catch (error) {
    next(error);
  }
};
