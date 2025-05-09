import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReviewApiService } from './review-api.service';
import { ReviewType } from '@models/review.model';

describe('ReviewApiService', () => {
  let service: ReviewApiService;
  let httpMock: HttpTestingController;
  let originalEnv: string | undefined;

  const mockReviews: ReviewType[] = [
    {
      _id: 'review1',
      userId: 'user1',
      recipeId: 'recipe123',
      rating: 5,
      content: 'Excellent recipe! Will make again.',
      createdAt: '2023-05-09T09:45:47.000Z',
      updatedAt: '2023-05-09T09:45:47.000Z'
    },
    {
      _id: 'review2',
      userId: 'user2',
      recipeId: 'recipe123',
      rating: 4,
      content: 'Very good but I added more garlic.',
      createdAt: '2023-05-08T14:30:22.000Z',
      updatedAt: '2023-05-08T14:30:22.000Z'
    }
  ];

  beforeEach(() => {
    originalEnv = process.env.API_URL;
    process.env.API_URL = 'https://api.test';

    TestBed.configureTestingModule({
      providers: [
        ReviewApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ReviewApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();

    if (originalEnv === undefined) {
      process.env.API_URL = '';
    } else {
      process.env.API_URL = originalEnv;
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getReviewsByRecipeId', () => {
    it('should send GET request to fetch reviews for a recipe', () => {
      const recipeId = 'recipe123';

      service.getReviewsByRecipeId(recipeId).subscribe(reviews => {
        expect(reviews).toEqual(mockReviews);
        expect(reviews.length).toBe(2);
        expect(reviews[0].rating).toBe(5);
        expect(reviews[1].content).toBe('Very good but I added more garlic.');
      });

      const req = httpMock.expectOne(`${process.env.API_URL}/reviews/${recipeId}`);
      expect(req.request.method).toBe('GET');

      req.flush(mockReviews);
    });
  });

  describe('addReview', () => {
    it('should send POST request with review data', () => {
      const recipeId = 'recipe123';
      const rating = 5;
      const content = 'Excellent recipe! Will make again.';
      const mockResponse = mockReviews[0];

      service.addReview(recipeId, rating, content).subscribe(review => {
        expect(review).toEqual(mockResponse);
        expect(review.rating).toBe(rating);
        expect(review.content).toBe(content);
      });

      const req = httpMock.expectOne(`${process.env.API_URL}/reviews/${recipeId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        rating,
        content
      });

      req.flush(mockResponse);
    });
  });

  describe('updateReview', () => {
    it('should send PUT request with updated review data', () => {
      const reviewId = 'review1';
      const rating = 4;
      const content = 'Updated: Good recipe but needs more seasoning.';
      const mockResponse = {
        ...mockReviews[0],
        rating,
        content,
        updatedAt: '2023-05-10T08:15:30.000Z'
      };

      service.updateReview(reviewId, rating, content).subscribe(review => {
        expect(review).toEqual(mockResponse);
        expect(review.rating).toBe(rating);
        expect(review.content).toBe(content);
      });

      const req = httpMock.expectOne(`${process.env.API_URL}/reviews/${reviewId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({
        rating,
        content
      });

      req.flush(mockResponse);
    });
  });

  describe('API URL construction', () => {
    it('should use different API URLs based on environment', () => {
      process.env.API_URL = 'https://different-api.test';

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ReviewApiService,
          provideHttpClient(),
          provideHttpClientTesting()
        ]
      });

      const freshService = TestBed.inject(ReviewApiService);
      const httpController = TestBed.inject(HttpTestingController);

      const recipeId = 'recipe123';
      const reviewId = 'review1';

      freshService.getReviewsByRecipeId(recipeId).subscribe();
      httpController.expectOne(`https://different-api.test/reviews/${recipeId}`).flush([]);

      freshService.addReview(recipeId, 5, 'Great!').subscribe();
      httpController.expectOne(`https://different-api.test/reviews/${recipeId}`).flush({});

      freshService.updateReview(reviewId, 4, 'Good').subscribe();
      httpController.expectOne(`https://different-api.test/reviews/${reviewId}`).flush({});

      httpController.verify();
    });
  });

  describe('Error handling', () => {
    it('should handle error when getting reviews', () => {
      service.getReviewsByRecipeId('nonexistent').subscribe({
        next: () => fail('Expected an error, not reviews'),
        error: error => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpMock.expectOne(`${process.env.API_URL}/reviews/nonexistent`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle error when adding a review', () => {
      service.addReview('recipe123', 5, 'Great!').subscribe({
        next: () => fail('Expected an error, not a successful response'),
        error: error => {
          expect(error.status).toBe(401);
          expect(error.statusText).toBe('Unauthorized');
        }
      });

      const req = httpMock.expectOne(`${process.env.API_URL}/reviews/recipe123`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });
});
