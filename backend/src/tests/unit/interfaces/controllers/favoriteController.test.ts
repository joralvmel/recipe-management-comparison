import {
  addFavoriteController,
  removeFavoriteController,
  getUserFavoritesController,
} from '@interfaces/controllers/favoriteController';
import type { AuthenticatedRequest } from '@shared/middlewares/authMiddleware';
import type { Response, NextFunction } from 'express';
import { addFavorite } from '@application/usecases/addFavorite';
import { removeFavorite } from '@application/usecases/removeFavorite';
import { getUserFavorites } from '@application/usecases/getUserFavorites';
import { BadRequestError, UnauthorizedError } from '@shared/errors/customErrors';

jest.mock('@application/usecases/addFavorite');
jest.mock('@application/usecases/removeFavorite');
jest.mock('@application/usecases/getUserFavorites');

describe('FavoriteController', () => {
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

  describe('addFavoriteController', () => {
    it('should add a favorite and return the favorite data', async () => {
      const favorite = { id: '1', userId: 'user1', recipeId: 'recipe1' };
      (addFavorite.prototype.execute as jest.Mock).mockResolvedValue(favorite);

      req.user = { id: 'user1', name: 'user1', email: 'test@example.com' };
      req.body = { recipeId: 'recipe1' };

      await addFavoriteController(req as AuthenticatedRequest, res as Response, next);

      expect(addFavorite.prototype.execute).toHaveBeenCalledWith('user1', 'recipe1');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(favorite);
    });

    it('should call next with an error if adding favorite fails', async () => {
      const error = new Error('Add favorite failed');
      (addFavorite.prototype.execute as jest.Mock).mockRejectedValue(error);

      req.user = { id: 'user1', name: 'user1', email: 'test@example.com' };
      req.body = { recipeId: 'recipe1' };

      await addFavoriteController(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call next with BadRequestError if recipeId is missing', async () => {
      req.user = { id: 'user1', name: 'user1', email: 'test@example.com' };
      req.body = {};

      await addFavoriteController(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(new BadRequestError('Recipe ID is required'));
    });

    it('should call next with UnauthorizedError if userId is missing', async () => {
      req.user = undefined;
      req.body = { recipeId: 'recipe1' };

      await addFavoriteController(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(new UnauthorizedError('Unauthorized'));
    });
  });

  describe('removeFavoriteController', () => {
    it('should remove a favorite and return a success message', async () => {
      (removeFavorite.prototype.execute as jest.Mock).mockResolvedValue(undefined);

      req.user = { id: 'user1', name: 'user1', email: 'test@example.com' };
      req.params = { recipeId: 'recipe1' };

      await removeFavoriteController(req as AuthenticatedRequest, res as Response, next);

      expect(removeFavorite.prototype.execute).toHaveBeenCalledWith('user1', 'recipe1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Favorite removed successfully' });
    });

    it('should call next with an error if removing favorite fails', async () => {
      const error = new Error('Remove favorite failed');
      (removeFavorite.prototype.execute as jest.Mock).mockRejectedValue(error);

      req.user = { id: 'user1', name: 'user1', email: 'test@example.com' };
      req.params = { recipeId: 'recipe1' };

      await removeFavoriteController(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call next with BadRequestError if recipeId is missing', async () => {
      req.user = { id: 'user1', name: 'user1', email: 'test@example.com' };
      req.params = {};

      await removeFavoriteController(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(new BadRequestError('Recipe ID is required'));
    });

    it('should call next with UnauthorizedError if userId is missing', async () => {
      req.user = undefined;
      req.params = { recipeId: 'recipe1' };

      await removeFavoriteController(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(new UnauthorizedError('Unauthorized'));
    });
  });

  describe('getUserFavoritesController', () => {
    it('should get user favorites and return the favorites data', async () => {
      const favorites = [{ id: '1', userId: 'user1', recipeId: 'recipe1' }];
      (getUserFavorites.prototype.execute as jest.Mock).mockResolvedValue(favorites);

      req.user = { id: 'user1', name: 'user1', email: 'test@example.com' };

      await getUserFavoritesController(req as AuthenticatedRequest, res as Response, next);

      expect(getUserFavorites.prototype.execute).toHaveBeenCalledWith('user1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(favorites);
    });

    it('should call next with an error if getting user favorites fails', async () => {
      const error = new Error('Get user favorites failed');
      (getUserFavorites.prototype.execute as jest.Mock).mockRejectedValue(error);

      req.user = { id: 'user1', name: 'user1', email: 'test@example.com' };

      await getUserFavoritesController(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call next with UnauthorizedError if userId is missing', async () => {
      req.user = undefined;

      await getUserFavoritesController(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(new UnauthorizedError('Unauthorized'));
    });
  });
});
