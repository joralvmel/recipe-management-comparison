import request from 'supertest';
import express from 'express';
import reviewRoutes from '@interfaces/routes/reviewRoutes';
import {
  addReviewController,
  editReviewController,
  getRecipeReviewsController,
} from '@interfaces/controllers/reviewController';
import { authMiddleware } from '@shared/middlewares/authMiddleware';

jest.mock('@interfaces/controllers/reviewController');
jest.mock('@shared/middlewares/authMiddleware');

const app = express();
app.use(express.json());
app.use('/reviews', reviewRoutes);

describe('Review Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /reviews/:id', () => {
    it('should call addReviewController', async () => {
      (authMiddleware as jest.Mock).mockImplementation((req, res, next) => next());
      (addReviewController as jest.Mock).mockImplementation((req, res) => res.status(201).send());

      const response = await request(app)
        .post('/reviews/recipe1')
        .send({ rating: 5, content: 'Great recipe!' });

      expect(response.status).toBe(201);
      expect(addReviewController).toHaveBeenCalled();
    });
  });

  describe('PUT /reviews/:reviewId', () => {
    it('should call editReviewController', async () => {
      (authMiddleware as jest.Mock).mockImplementation((req, res, next) => next());
      (editReviewController as jest.Mock).mockImplementation((req, res) => res.status(200).send());

      const response = await request(app)
        .put('/reviews/review1')
        .send({ rating: 4, content: 'Good recipe!' });

      expect(response.status).toBe(200);
      expect(editReviewController).toHaveBeenCalled();
    });
  });

  describe('GET /reviews/:id', () => {
    it('should call getRecipeReviewsController', async () => {
      (getRecipeReviewsController as jest.Mock).mockImplementation((req, res) => res.status(200).send());

      const response = await request(app)
        .get('/reviews/recipe1');

      expect(response.status).toBe(200);
      expect(getRecipeReviewsController).toHaveBeenCalled();
    });
  });
});
