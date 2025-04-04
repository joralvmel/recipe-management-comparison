import request from 'supertest';
import app from '@src/index';

describe('Recipe Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /recipes/search', () => {
    it('should search for recipes and return 200 status', async () => {
      const res = await request(app).get('/recipes/search').query({ query: 'pasta' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.results[0]).toHaveProperty('id');
      expect(res.body.results[0]).toHaveProperty('title');
      expect(res.body.results[0]).toHaveProperty('image');
      expect(res.body.results[0]).toHaveProperty('readyInMinutes');
      expect(res.body.results[0]).toHaveProperty('healthScore');
      expect(res.body.results[0]).toHaveProperty('cuisines');
      expect(res.body.results[0]).toHaveProperty('dishTypes');
      expect(res.body.results[0]).toHaveProperty('diets');
    });
  });

  describe('GET /recipes/:id', () => {
    it('should get recipe details and return 200 status', async () => {
      const res = await request(app).get('/recipes/123');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('externalId');
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('image');
      expect(res.body).toHaveProperty('readyInMinutes');
      expect(res.body).toHaveProperty('healthScore');
      expect(res.body).toHaveProperty('cuisines');
      expect(res.body).toHaveProperty('dishTypes');
      expect(res.body).toHaveProperty('diets');
      expect(res.body).toHaveProperty('servings');
      expect(res.body).toHaveProperty('analyzedInstructions');
      expect(res.body).toHaveProperty('extendedIngredients');
    });
  });
});
