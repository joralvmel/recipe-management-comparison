import { AuthenticatedRequest } from '@shared/middlewares/authMiddleware';
import { Response, NextFunction } from 'express';
import { addFavorite } from '@application/usecases/addFavorite';
import { removeFavorite } from '@application/usecases/removeFavorite';
import { getUserFavorites } from '@application/usecases/getUserFavorites';
import { FavoriteService } from '@application/services/favoriteService';
import { BadRequestError, UnauthorizedError } from '@shared/errors/customErrors';

const favoriteService = new FavoriteService();

const addFavoriteUseCase = new addFavorite(favoriteService);
const removeFavoriteUseCase = new removeFavorite(favoriteService);
const getUserFavoritesUseCase = new getUserFavorites(favoriteService);

export const addFavoriteController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { recipeId } = req.body;
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }
    if (!recipeId) {
      throw new BadRequestError('Recipe ID is required');
    }
    const favorite = await addFavoriteUseCase.execute(userId, recipeId);
    res.status(201).json(favorite);
  } catch (error) {
    next(error);
  }
};

export const removeFavoriteController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { recipeId } = req.params;
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }
    if (!recipeId) {
      throw new BadRequestError('Recipe ID is required');
    }
    await removeFavoriteUseCase.execute(userId, recipeId);
    res.status(200).json({ message: 'Favorite removed successfully' });
  } catch (error) {
    next(error);
  }
};

export const getUserFavoritesController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }
    const favorites = await getUserFavoritesUseCase.execute(userId);
    res.status(200).json(favorites);
  } catch (error) {
    next(error);
  }
};
