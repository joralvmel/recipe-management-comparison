import { Router } from 'express';
import { searchRecipesController, getRecipeDetailController } from '../controllers/recipeController';

const router = Router();

router.get('/search', searchRecipesController);
router.get('/:id', getRecipeDetailController);

export default router;
