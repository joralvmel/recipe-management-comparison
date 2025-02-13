import { Router } from 'express';
import { searchRecipesController } from '../controllers/recipeController';

const router = Router();

router.get('/search', searchRecipesController);

export default router;
