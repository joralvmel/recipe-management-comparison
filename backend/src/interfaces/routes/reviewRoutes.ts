// src/interfaces/routes/reviewRoutes.ts
import { Router } from 'express';
import { addReviewController, editReviewController, getRecipeReviewsController } from '../controllers/reviewController';
import { authMiddleware } from '@shared/middlewares/authMiddleware';

const router = Router();

router.post('/:id', authMiddleware, addReviewController);
router.put('/:reviewId', authMiddleware, editReviewController);
router.get('/:id', getRecipeReviewsController);

export default router;
