import request from 'supertest';
import app from '@src/index';
import { setupAuth } from '@tests/authSetup';

describe('Review Routes Integration Tests', () => {
  let token: string;

  beforeAll(async () => {
    token = await setupAuth();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /reviews/:id', () => {
    it('should add a review and return 201 status', async () => {
      const res = await request(app)
        .post('/reviews/recipe1')
        .send({ rating: 5, content: 'Great recipe!' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('rating', 5);
      expect(res.body).toHaveProperty('content', 'Great recipe!');
      expect(res.body).toHaveProperty('recipeId', 'recipe1');
      expect(res.body).toHaveProperty('userId');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/reviews/recipe1')
        .send({ rating: 5, content: 'Great recipe!' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'No token provided');
    });
  });

  describe('PUT /reviews/:reviewId', () => {
    let reviewId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/reviews/recipe1')
        .send({ rating: 5, content: 'Great recipe!' })
        .set('Authorization', `Bearer ${token}`);
      reviewId = res.body._id;
    });

    it('should edit a review and return 200 status', async () => {
      const res = await request(app)
        .put(`/reviews/${reviewId}`)
        .send({ rating: 4, content: 'Good recipe!' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('rating', 4);
      expect(res.body).toHaveProperty('content', 'Good recipe!');
      expect(res.body).toHaveProperty('recipeId', 'recipe1');
      expect(res.body).toHaveProperty('userId');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .put(`/reviews/${reviewId}`)
        .send({ rating: 4, content: 'Good recipe!' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'No token provided');
    });
  });

  describe('GET /reviews/:id', () => {
    beforeEach(async () => {
      await request(app)
        .post('/reviews/recipe1')
        .send({ rating: 5, content: 'Great recipe!' })
        .set('Authorization', `Bearer ${token}`);
    });

    it('should get recipe reviews and return 200 status', async () => {
      const res = await request(app)
        .get('/reviews/recipe1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('_id');
      expect(res.body[0]).toHaveProperty('createdAt');
      expect(res.body[0]).toHaveProperty('rating', 5);
      expect(res.body[0]).toHaveProperty('content', 'Great recipe!');
      expect(res.body[0]).toHaveProperty('recipeId', 'recipe1');
      expect(res.body[0]).toHaveProperty('userId');
    });
  });
});
