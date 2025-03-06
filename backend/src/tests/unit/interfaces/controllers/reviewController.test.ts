import {
  addReviewController,
  editReviewController,
  getRecipeReviewsController,
} from '@interfaces/controllers/reviewController';
import type { AuthenticatedRequest } from '@shared/middlewares/authMiddleware';
import type { Request, Response, NextFunction } from 'express';
import { addReview } from '@application/usecases/addReview';
import { editReview } from '@application/usecases/editReview';
import { getRecipeReviews } from '@application/usecases/getRecipeReviews';
import type { AddReviewDTO, EditReviewDTO } from '@shared/dtos/ReviewDTO';
import type { ParamsDictionary } from 'express-serve-static-core';
import { ResourceNotFoundError, BadRequestError } from '@shared/errors/customErrors';

jest.mock('@application/usecases/addReview');
jest.mock('@application/usecases/editReview');
jest.mock('@application/usecases/getRecipeReviews');

describe('ReviewController', () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  const setupRequest = (user: AuthenticatedRequest['user'], params: ParamsDictionary, body: AddReviewDTO | EditReviewDTO) => {
    req.user = user;
    req.params = params;
    req.body = body;
  };

  describe('addReviewController', () => {
    it('should add a review and return the review data', async () => {
      const review = { id: '1', userId: 'user1', recipeId: 'recipe1', rating: 5, content: 'Great recipe!' };
      (addReview.prototype.execute as jest.Mock).mockResolvedValue(review);

      setupRequest({ id: 'user1', email: 'test@example.com' }, { id: 'recipe1' }, { rating: 5, content: 'Great recipe!' } as AddReviewDTO);

      await addReviewController(req as AuthenticatedRequest, res as Response, next);

      expect(addReview.prototype.execute).toHaveBeenCalledWith('user1', 'recipe1', 5, 'Great recipe!');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(review);
    });

    it('should call next with an error if adding review fails', async () => {
      const error = new Error('Add review failed');
      (addReview.prototype.execute as jest.Mock).mockRejectedValue(error);

      setupRequest({ id: 'user1', email: 'test@example.com' }, { id: 'recipe1' }, { rating: 5, content: 'Great recipe!' } as AddReviewDTO);

      await addReviewController(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call next with BadRequestError if userId is missing', async () => {
      setupRequest(undefined, { id: 'recipe1' }, { rating: 5, content: 'Great recipe!' } as AddReviewDTO);

      await addReviewController(req as AuthenticatedRequest, res as Response, next);
      const error = (next as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.message).toEqual('Missing required fields');
    });

    it('should call next with BadRequestError if recipeId is missing', async () => {
      setupRequest({ id: 'user1', email: 'test@example.com' }, {}, { rating: 5, content: 'Great recipe!' } as AddReviewDTO);

      await addReviewController(req as AuthenticatedRequest, res as Response, next);
      const error = (next as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.message).toEqual('Missing required fields');
    });

    it('should call next with BadRequestError if rating is missing', async () => {
      setupRequest({ id: 'user1', email: 'test@example.com' }, { id: 'recipe1' }, { content: 'Great recipe!' } as AddReviewDTO);

      await addReviewController(req as AuthenticatedRequest, res as Response, next);
      const error = (next as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.message).toEqual('Missing required fields');
    });

    it('should call next with BadRequestError if content is missing', async () => {
      setupRequest({ id: 'user1', email: 'test@example.com' }, { id: 'recipe1' }, { rating: 5 } as AddReviewDTO);

      await addReviewController(req as AuthenticatedRequest, res as Response, next);
      const error = (next as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.message).toEqual('Missing required fields');
    });
  });

  describe('editReviewController', () => {
    it('should edit a review and return the updated review data', async () => {
      const updatedReview = { id: '1', userId: 'user1', recipeId: 'recipe1', rating: 4, content: 'Good recipe!' };
      (editReview.prototype.execute as jest.Mock).mockResolvedValue(updatedReview);

      setupRequest({ id: 'user1', email: 'test@example.com' }, { reviewId: '1' }, { rating: 4, content: 'Good recipe!' } as EditReviewDTO);

      await editReviewController(req as AuthenticatedRequest, res as Response, next);

      expect(editReview.prototype.execute).toHaveBeenCalledWith('user1', '1', { rating: 4, content: 'Good recipe!' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedReview);
    });

    it('should call next with an error if editing review fails', async () => {
      const error = new Error('Edit review failed');
      (editReview.prototype.execute as jest.Mock).mockRejectedValue(error);

      setupRequest({ id: 'user1', email: 'test@example.com' }, { reviewId: '1' }, { rating: 4, content: 'Good recipe!' } as EditReviewDTO);

      await editReviewController(req as AuthenticatedRequest, res as Response, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call next with BadRequestError if userId is missing', async () => {
      setupRequest(undefined, { reviewId: '1' }, { rating: 4, content: 'Good recipe!' } as EditReviewDTO);

      await editReviewController(req as AuthenticatedRequest, res as Response, next);
      const error = (next as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.message).toEqual('User ID is required');
    });

    it('should call next with BadRequestError if reviewId is missing', async () => {
      setupRequest({ id: 'user1', email: 'test@example.com' }, {}, { rating: 4, content: 'Good recipe!' } as EditReviewDTO);

      await editReviewController(req as AuthenticatedRequest, res as Response, next);
      const error = (next as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.message).toEqual('Review ID is required');
    });

    it('should call next with ResourceNotFoundError if updatedReview is null', async () => {
      setupRequest({ id: 'user1', email: 'test@example.com' }, { reviewId: '1' }, { rating: 4, content: 'Good recipe!' } as EditReviewDTO);
      (editReview.prototype.execute as jest.Mock).mockResolvedValue(null);

      await editReviewController(req as AuthenticatedRequest, res as Response, next);
      const error = (next as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ResourceNotFoundError);
      expect(error.message).toEqual('Review does not exist');
    });
  });

  describe('getRecipeReviewsController', () => {
    it('should get recipe reviews and return the reviews data', async () => {
      const reviews = [{ id: '1', userId: 'user1', recipeId: 'recipe1', rating: 5, content: 'Great recipe!' }];
      (getRecipeReviews.prototype.execute as jest.Mock).mockResolvedValue(reviews);

      setupRequest({ id: 'user1', email: 'test@example.com' }, { id: 'recipe1' }, {});

      await getRecipeReviewsController(req as Request, res as Response, next);

      expect(getRecipeReviews.prototype.execute).toHaveBeenCalledWith('recipe1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(reviews);
    });

    it('should call next with an error if getting recipe reviews fails', async () => {
      const error = new Error('Get recipe reviews failed');
      (getRecipeReviews.prototype.execute as jest.Mock).mockRejectedValue(error);

      setupRequest({ id: 'user1', email: 'test@example.com' }, { id: 'recipe1' }, {});

      await getRecipeReviewsController(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call next with BadRequestError if recipeId is missing', async () => {
      setupRequest({ id: 'user1', email: 'test@example.com' }, {}, {});

      await getRecipeReviewsController(req as Request, res as Response, next);
      const error = (next as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.message).toEqual('Recipe ID is missing');
    });
  });
});
