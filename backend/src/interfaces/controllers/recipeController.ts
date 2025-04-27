import type { Request, Response, NextFunction } from 'express';
import { getRecipeDetail } from '@application/usecases/getRecipeDetail';
import { searchRecipes } from '@application/usecases/searchRecipes';
import type { RecipeSearchDTO } from '@shared/dtos/RecipeDTO';

export const searchRecipesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.query;

    const searchParams: RecipeSearchDTO = {
      query: query as string,
      cuisine: req.query.cuisine as string,
      diet: req.query.diet as string,
      intolerances: req.query.intolerances as string,
      mealType: req.query.mealType as string,
      offset: Number.parseInt(req.query.offset as string, 10) || 0,
      number: Number.parseInt(req.query.number as string, 10) || 10,
    };
    const recipes = await searchRecipes(searchParams);
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
    const recipeDetail = await getRecipeDetail(id);
    res.status(200).json(recipeDetail);
  } catch (error: unknown) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error('An unknown error occurred'));
    }
  }
};
