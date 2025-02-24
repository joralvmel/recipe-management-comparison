import { AuthenticatedRequest } from '@shared/middlewares/authMiddleware';
import { Response, NextFunction } from 'express';
import { addFavorite } from '@application/usecases/addFavorite';
import { removeFavorite } from '@application/usecases/removeFavorite';
import { getUserFavorites } from '@application/usecases/getUserFavorites';
import { FavoriteService } from '@application/services/favoriteService';

const favoriteService = new FavoriteService();

const addFavoriteUseCase = new addFavorite(favoriteService);
const removeFavoriteUseCase = new removeFavorite(favoriteService);
const getUserFavoritesUseCase = new getUserFavorites(favoriteService);

export const addFavoriteController = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { recipeId } = req.body;
    if (!userId || !recipeId) {
      res.status(400).json({ error: 'User ID and Recipe ID are required' });
      return;
    }
    const favorite = await addFavoriteUseCase.execute(userId, recipeId);
    res.status(201).json(favorite);
  } catch (error) {
    next(error);
  }
};

export const removeFavoriteController = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { recipeId } = req.params;
    if (!userId || !recipeId) {
      res.status(400).json({ error: 'User ID and Recipe ID are required' });
      return;
    }
    await removeFavoriteUseCase.execute(userId, recipeId);
    res.status(200).json({ message: 'Favorite removed successfully' });
  } catch (error) {
    next(error);
  }
};

export const getUserFavoritesController = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const favorites = await getUserFavoritesUseCase.execute(userId);
    res.status(200).json(favorites);
  } catch (error) {
    next(error);
  }
};
