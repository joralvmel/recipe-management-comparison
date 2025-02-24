import { Request, Response, NextFunction } from 'express';
import { addReview } from '@application/usecases/addReview';
import { editReview } from '@application/usecases/editReview';
import { getRecipeReviews } from '@application/usecases/getRecipeReviews';
import { ReviewService } from '@application/services/reviewService';
import { AddReviewDTO, EditReviewDTO } from '@shared/dtos/ReviewDTO';
import { AuthenticatedRequest } from '@shared/middlewares/authMiddleware';
import { ResourceNotFoundError } from '@shared/errors/customErrors';

const reviewService = new ReviewService();
const addReviewUseCase = new addReview(reviewService);
const editReviewUseCase = new editReview(reviewService);
const getRecipeReviewsUseCase = new getRecipeReviews(reviewService);

export const addReviewController = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const recipeId = req.params.id;
    const { rating, content } = req.body as AddReviewDTO;
    if (!userId || !recipeId || rating == null || !content) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const review = await addReviewUseCase.execute(userId, recipeId, rating, content);
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

export const editReviewController = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reviewId = req.params.reviewId;
    const reviewData = req.body as EditReviewDTO;
    if (!reviewId) {
      res.status(400).json({ error: 'Review ID is required' });
      return;
    }
    const updatedReview = await editReviewUseCase.execute(reviewId, reviewData);
    if (!updatedReview) {
      throw new ResourceNotFoundError('Review does not exist');
    }
    res.status(200).json(updatedReview);
  } catch (error) {
    next(error);
  }
};

export const getRecipeReviewsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const recipeId = req.params.id;
    if (!recipeId) {
      res.status(400).json({ error: 'Recipe ID is missing' });
      return;
    }
    const reviews = await getRecipeReviewsUseCase.execute(recipeId);
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};
