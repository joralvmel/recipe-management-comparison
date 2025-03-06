import request from 'supertest';
import express from 'express';
import favoriteRoutes from '@interfaces/routes/favoriteRoutes';
import {
  addFavoriteController,
  removeFavoriteController,
  getUserFavoritesController,
} from '@interfaces/controllers/favoriteController';
import { authMiddleware } from '@shared/middlewares/authMiddleware';

jest.mock('@interfaces/controllers/favoriteController');
jest.mock('@shared/middlewares/authMiddleware');

const app = express();
app.use(express.json());
app.use('/favorites', favoriteRoutes);

describe('Favorite Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /favorites', () => {
    it('should call addFavoriteController', async () => {
      (authMiddleware as jest.Mock).mockImplementation((req, res, next) => next());
      (addFavoriteController as jest.Mock).mockImplementation((req, res) => res.status(201).send());

      const response = await request(app)
        .post('/favorites')
        .send({ recipeId: 'recipe1' });

      expect(response.status).toBe(201);
      expect(addFavoriteController).toHaveBeenCalled();
    });
  });

  describe('DELETE /favorites/:recipeId', () => {
    it('should call removeFavoriteController', async () => {
      (authMiddleware as jest.Mock).mockImplementation((req, res, next) => next());
      (removeFavoriteController as jest.Mock).mockImplementation((req, res) => res.status(200).send());

      const response = await request(app)
        .delete('/favorites/recipe1');

      expect(response.status).toBe(200);
      expect(removeFavoriteController).toHaveBeenCalled();
    });
  });

  describe('GET /favorites', () => {
    it('should call getUserFavoritesController', async () => {
      (authMiddleware as jest.Mock).mockImplementation((req, res, next) => next());
      (getUserFavoritesController as jest.Mock).mockImplementation((req, res) => res.status(200).send());

      const response = await request(app)
        .get('/favorites');

      expect(response.status).toBe(200);
      expect(getUserFavoritesController).toHaveBeenCalled();
    });
  });
});
