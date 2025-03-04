import request from 'supertest';
import express from 'express';
import recipeRoutes from '@interfaces/routes/recipeRoutes';
import { searchRecipesController, getRecipeDetailController } from '@interfaces/controllers/recipeController';

jest.mock('@interfaces/controllers/recipeController');

const app = express();
app.use(express.json());
app.use('/recipes', recipeRoutes);

describe('Recipe Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /recipes/search', () => {
    it('should call searchRecipesController', async () => {
      (searchRecipesController as jest.Mock).mockImplementation((req, res) => res.status(200).send());

      const response = await request(app)
        .get('/recipes/search')
        .query({ query: 'pasta' });

      expect(response.status).toBe(200);
      expect(searchRecipesController).toHaveBeenCalled();
    });
  });

  describe('GET /recipes/:id', () => {
    it('should call getRecipeDetailController', async () => {
      (getRecipeDetailController as jest.Mock).mockImplementation((req, res) => res.status(200).send());

      const response = await request(app)
        .get('/recipes/1');

      expect(response.status).toBe(200);
      expect(getRecipeDetailController).toHaveBeenCalled();
    });
  });
});
