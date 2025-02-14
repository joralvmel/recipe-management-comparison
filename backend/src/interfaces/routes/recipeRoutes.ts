import { Router } from 'express';
import {
  searchRecipesController,
  getRecipeDetailController,
  getAndCacheRecipeDetailController,
} from '../controllers/recipeController';

const router = Router();

router.get('/search', searchRecipesController);
router.get('/:id', getRecipeDetailController);
router.get('/cache/:id', getAndCacheRecipeDetailController);

export default router;
