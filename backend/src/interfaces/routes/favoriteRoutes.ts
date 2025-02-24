import { Router } from 'express';
import {
  addFavoriteController,
  removeFavoriteController,
  getUserFavoritesController,
} from '../controllers/favoriteController';
import { authMiddleware } from '@shared/middlewares/authMiddleware';

const router = Router();

router.post('/', authMiddleware, addFavoriteController);
router.delete('/:recipeId', authMiddleware, removeFavoriteController);
router.get('/', authMiddleware, getUserFavoritesController);

export default router;
