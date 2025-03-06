import request from 'supertest';
import app from '@src/index';
import { setupAuth } from '@tests/authSetup';

describe('Favorite Routes Integration Tests', () => {
  let token: string;

  beforeAll(async () => {
    token = await setupAuth();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /favorites', () => {
    it('should add a favorite and return 201 status', async () => {
      const res = await request(app)
        .post('/favorites')
        .send({ recipeId: 'recipe1' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('recipeId', 'recipe1');
      expect(res.body).toHaveProperty('userId');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).post('/favorites').send({ recipeId: 'recipe1' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'No token provided');
    });
  });

  describe('DELETE /favorites/:recipeId', () => {
    beforeEach(async () => {
      await request(app).post('/favorites').send({ recipeId: 'recipe1' }).set('Authorization', `Bearer ${token}`);
    });

    it('should remove a favorite and return 200 status', async () => {
      const res = await request(app).delete('/favorites/recipe1').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Favorite removed successfully');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).delete('/favorites/recipe1');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'No token provided');
    });
  });

  describe('GET /favorites', () => {
    beforeEach(async () => {
      await request(app).post('/favorites').send({ recipeId: 'recipe1' }).set('Authorization', `Bearer ${token}`);
    });

    it('should get user favorites and return 200 status', async () => {
      const res = await request(app).get('/favorites').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('_id');
      expect(res.body[0]).toHaveProperty('createdAt');
      expect(res.body[0]).toHaveProperty('recipeId', 'recipe1');
      expect(res.body[0]).toHaveProperty('userId');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/favorites');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'No token provided');
    });
  });
});
