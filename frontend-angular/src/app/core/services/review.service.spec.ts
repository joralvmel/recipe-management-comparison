import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ReviewService } from './review.service';
import { ReviewApiService } from '@core/http/review-api.service';
import { AuthStoreService } from '@core/store/auth-store.service';
import { NotificationService } from '@shared/services/notification.service';
import { ReviewType } from '@models/review.model';
import { HttpErrorResponse } from '@angular/common/http';

interface ReviewServicePrivate {
  reviewsSubject: BehaviorSubject<ReviewType[]>;
  loadingSubject: BehaviorSubject<boolean>;
  recipeReviewsCache: { [recipeId: string]: ReviewType[] };
  handleApiError: (error: HttpErrorResponse, defaultMessage: string) => void;
  isUserAuthenticated: () => boolean;
  checkUserAuth: (errorMessage?: string) => boolean;
  getUser: () => { id: string, name: string };
}

describe('ReviewService', () => {
  let service: ReviewService;
  let servicePrivate: ReviewServicePrivate;
  let reviewApiServiceSpy: jasmine.SpyObj<ReviewApiService>;
  let authStoreServiceSpy: jasmine.SpyObj<AuthStoreService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  const RECIPE_ID_1 = 'recipe1';
  const RECIPE_ID_2 = 'recipe2';
  const RECIPE_ID_3 = 'recipe3';

  const mockReviews: ReviewType[] = [
    {
      _id: '1',
      userId: 'user1',
      userName: 'John Doe',
      recipeId: RECIPE_ID_1,
      rating: 5,
      content: 'Great recipe!',
      createdAt: '2025-01-01T00:00:00.000Z'
    },
    {
      _id: '2',
      userId: 'user2',
      userName: 'Jane Smith',
      recipeId: RECIPE_ID_1,
      rating: 4,
      content: 'Very good',
      createdAt: '2025-01-02T00:00:00.000Z'
    },
    {
      _id: '3',
      userId: 'user1',
      userName: 'John Doe',
      recipeId: RECIPE_ID_2,
      rating: 3,
      content: 'Average',
      createdAt: '2025-01-03T00:00:00.000Z'
    }
  ];

  const mockUser = {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com'
  };

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ReviewApiService', [
      'getReviewsByRecipeId',
      'addReview',
      'updateReview',
      'deleteReview'
    ]);

    const authSpy = jasmine.createSpyObj('AuthStoreService', [], {
      isAuthenticated: true,
      currentUser: mockUser
    });

    const notifySpy = jasmine.createSpyObj('NotificationService', ['showNotification']);

    TestBed.configureTestingModule({
      providers: [
        ReviewService,
        { provide: ReviewApiService, useValue: apiSpy },
        { provide: AuthStoreService, useValue: authSpy },
        { provide: NotificationService, useValue: notifySpy }
      ]
    });

    service = TestBed.inject(ReviewService);
    servicePrivate = service as unknown as ReviewServicePrivate;

    reviewApiServiceSpy = TestBed.inject(ReviewApiService) as jasmine.SpyObj<ReviewApiService>;
    authStoreServiceSpy = TestBed.inject(AuthStoreService) as jasmine.SpyObj<AuthStoreService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;

    servicePrivate.reviewsSubject = new BehaviorSubject<ReviewType[]>(mockReviews);

    reviewApiServiceSpy.getReviewsByRecipeId.and.returnValue(of(mockReviews.filter(r => r.recipeId === RECIPE_ID_1)));

    if (process?.env) {
      process.env.USE_BACKEND = 'false';
    }
  });

  afterEach(() => {
    jasmine.getEnv().allowRespy(true);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getReviewsByRecipeId', () => {
    it('should return reviews for specific recipe from subject when not using backend', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: false });

      service.getReviewsByRecipeId(RECIPE_ID_1).subscribe(reviews => {
        expect(reviews.length).toBe(2);
        expect(reviews[0].recipeId).toBe(RECIPE_ID_1);
        expect(reviews[1].recipeId).toBe(RECIPE_ID_1);
        done();
      });
    });

    it('should get reviews from API when using backend and cache is empty', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: true });
      servicePrivate.recipeReviewsCache = {};

      service.getReviewsByRecipeId(RECIPE_ID_1).subscribe(reviews => {
        expect(reviewApiServiceSpy.getReviewsByRecipeId).toHaveBeenCalledWith(RECIPE_ID_1);
        const cachedReviews = servicePrivate.recipeReviewsCache[RECIPE_ID_1];
        expect(cachedReviews).toBeDefined();
        expect(reviews.length).toBe(2);
        done();
      });
    });

    it('should return reviews from cache when using backend and cache is populated', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: true });

      servicePrivate.recipeReviewsCache = {};
      const cachedReviews = [mockReviews[0]];
      servicePrivate.recipeReviewsCache[RECIPE_ID_1] = cachedReviews;

      service.getReviewsByRecipeId(RECIPE_ID_1).subscribe(reviews => {
        expect(reviewApiServiceSpy.getReviewsByRecipeId).not.toHaveBeenCalled();
        expect(reviews).toEqual(cachedReviews);
        done();
      });
    });

    it('should handle API errors when fetching reviews', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: true });
      servicePrivate.recipeReviewsCache = {};

      spyOn(console, 'error');
      reviewApiServiceSpy.getReviewsByRecipeId.and.returnValue(
        throwError(() => new Error('API Error'))
      );

      service.getReviewsByRecipeId(RECIPE_ID_1).subscribe(reviews => {
        expect(console.error).toHaveBeenCalled();
        expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
          'Unable to load reviews. Please try again later.',
          'error'
        );
        expect(reviews).toEqual([]);
        done();
      });
    });

    it('should update loading state while fetching reviews', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: false });

      const loadingValues: boolean[] = [];

      const subscription = service.loading$.subscribe(isLoading => {
        loadingValues.push(isLoading);

        if (isLoading === false && loadingValues.length > 1) {
          expect(loadingValues).toContain(true);
          expect(loadingValues[loadingValues.length - 1]).toBe(false);
          subscription.unsubscribe();
          done();
        }
      });

      service.getReviewsByRecipeId(RECIPE_ID_1).subscribe();
    });
  });

  describe('getUserReviewForRecipe', () => {
    it('should return undefined if user is not authenticated', (done: DoneFn) => {
      Object.defineProperty(authStoreServiceSpy, 'isAuthenticated', {
        get: () => false
      });

      service.getUserReviewForRecipe(RECIPE_ID_1).subscribe(review => {
        expect(review).toBeUndefined();
        done();
      });
    });

    it('should return undefined if currentUser is null', (done: DoneFn) => {
      Object.defineProperty(authStoreServiceSpy, 'currentUser', {
        get: () => null
      });

      service.getUserReviewForRecipe(RECIPE_ID_1).subscribe(review => {
        expect(review).toBeUndefined();
        done();
      });
    });

    it('should find user review from subject when not using backend', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: false });

      service.getUserReviewForRecipe(RECIPE_ID_1).subscribe(review => {
        expect(review).toBeDefined();
        expect(review?.userId).toBe('user1');
        expect(review?.recipeId).toBe(RECIPE_ID_1);
        done();
      });
    });

    it('should find user review from cache when using backend and cache is populated', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: true });

      servicePrivate.recipeReviewsCache = {};
      servicePrivate.recipeReviewsCache[RECIPE_ID_1] = mockReviews.filter(r => r.recipeId === RECIPE_ID_1);

      service.getUserReviewForRecipe(RECIPE_ID_1).subscribe(review => {
        expect(review).toBeDefined();
        expect(review?.userId).toBe('user1');
        expect(review?.recipeId).toBe(RECIPE_ID_1);
        done();
      });
    });

    it('should fetch reviews and find user review when using backend and cache is empty', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: true });
      servicePrivate.recipeReviewsCache = {};

      service.getUserReviewForRecipe(RECIPE_ID_1).subscribe(review => {
        expect(reviewApiServiceSpy.getReviewsByRecipeId).toHaveBeenCalledWith(RECIPE_ID_1);
        expect(review).toBeDefined();
        expect(review?.userId).toBe('user1');
        expect(review?.recipeId).toBe(RECIPE_ID_1);
        done();
      });
    });

    it('should return undefined when user has no review for the recipe in subject', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: false });
      const recipeIdWithNoUserReview = 'recipe-no-review';

      service.getUserReviewForRecipe(recipeIdWithNoUserReview).subscribe(review => {
        expect(review).toBeUndefined();
        done();
      });
    });
  });

  describe('addReview', () => {
    it('should throw error if user is not authenticated', (done: DoneFn) => {
      Object.defineProperty(authStoreServiceSpy, 'isAuthenticated', {
        get: () => false
      });

      service.addReview(RECIPE_ID_3, 5, 'Great!').subscribe({
        next: () => {
          fail('Should not reach here');
        },
        error: (error) => {
          expect(error.message).toBe('User must be logged in to add a review');
          expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
            'You must be logged in to add a review',
            'warning'
          );
          done();
        }
      });
    });

    it('should add review to subject when not using backend', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: false });
      spyOn(Date.prototype, 'toISOString').and.returnValue('2025-05-08T00:00:00.000Z');
      spyOn(Math, 'random').and.returnValue(0.5);

      const initialLength = servicePrivate.reviewsSubject.value.length;

      service.addReview(RECIPE_ID_3, 5, 'Great!').subscribe(review => {
        expect(servicePrivate.reviewsSubject.value.length).toBe(initialLength + 1);
        expect(review.userId).toBe('user1');
        expect(review.recipeId).toBe(RECIPE_ID_3);
        expect(review.rating).toBe(5);
        expect(review.content).toBe('Great!');
        expect(review.createdAt).toBe('2025-05-08T00:00:00.000Z');
        expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
          'Your review has been added!',
          'success'
        );
        done();
      });
    });

    it('should throw error if user already reviewed the recipe when not using backend', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: false });

      service.addReview(RECIPE_ID_1, 5, 'Great!').subscribe({
        next: () => {
          fail('Should not reach here');
        },
        error: (error) => {
          expect(error.message).toBe('User already has a review for this recipe');
          expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
            'You have already reviewed this recipe',
            'warning'
          );
          done();
        }
      });
    });

    it('should call API and update cache when using backend', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: true });

      const newReview: ReviewType = {
        _id: '4',
        userId: 'user1',
        userName: 'John Doe',
        recipeId: RECIPE_ID_3,
        rating: 5,
        content: 'Great!',
        createdAt: '2025-05-08T00:00:00.000Z'
      };

      reviewApiServiceSpy.addReview.and.returnValue(of(newReview));

      servicePrivate.recipeReviewsCache = {};
      servicePrivate.recipeReviewsCache[RECIPE_ID_3] = [];

      service.addReview(RECIPE_ID_3, 5, 'Great!').subscribe(review => {
        expect(reviewApiServiceSpy.addReview).toHaveBeenCalledWith(RECIPE_ID_3, 5, 'Great!');
        const cachedReviews = servicePrivate.recipeReviewsCache[RECIPE_ID_3];
        expect(cachedReviews).toContain(newReview);
        expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
          'Your review has been added!',
          'success'
        );
        done();
      });
    });

    it('should handle API errors when adding review', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: true });

      spyOn(console, 'error');
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Server error' },
        status: 500,
        statusText: 'Internal Server Error'
      });

      reviewApiServiceSpy.addReview.and.returnValue(throwError(() => errorResponse));

      service.addReview(RECIPE_ID_3, 5, 'Great!').subscribe({
        next: () => {
          fail('Should not reach here');
        },
        error: (error) => {
          expect(console.error).toHaveBeenCalled();
          expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
            'Failed to add review. Please try again later.',
            'error'
          );
          expect(error.message).toBe('Failed to add review');
          done();
        }
      });
    });

    it('should handle specific API error for duplicate review', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: true });

      spyOn(console, 'error');
      const errorResponse = new HttpErrorResponse({
        error: { message: 'User has already reviewed this recipe' },
        status: 400,
        statusText: 'Bad Request'
      });

      reviewApiServiceSpy.addReview.and.returnValue(throwError(() => errorResponse));

      service.addReview(RECIPE_ID_1, 5, 'Great!').subscribe({
        next: () => {
          fail('Should not reach here');
        },
        error: (error) => {
          expect(console.error).toHaveBeenCalled();
          expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
            'You have already reviewed this recipe',
            'warning'
          );
          expect(error.message).toBe('Failed to add review');
          done();
        }
      });
    });
  });

  describe('updateReview', () => {
    it('should throw error if user is not authenticated', (done: DoneFn) => {
      Object.defineProperty(authStoreServiceSpy, 'isAuthenticated', {
        get: () => false
      });

      service.updateReview('1', 4, 'Updated content').subscribe({
        next: () => {
          fail('Should not reach here');
        },
        error: (error) => {
          expect(error.message).toBe('User must be logged in to update a review');
          expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
            'You must be logged in to update a review',
            'warning'
          );
          done();
        }
      });
    });

    it('should update review in subject when not using backend', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: false });
      spyOn(Date.prototype, 'toISOString').and.returnValue('2025-05-08T00:00:00.000Z');

      service.updateReview('1', 4, 'Updated content').subscribe(review => {
        expect(review.rating).toBe(4);
        expect(review.content).toBe('Updated content');
        expect(review.updatedAt).toBe('2025-05-08T00:00:00.000Z');

        const updatedReview = servicePrivate.reviewsSubject.value.find(r => r._id === '1');
        expect(updatedReview?.rating).toBe(4);
        expect(updatedReview?.content).toBe('Updated content');

        expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
          'Your review has been updated!',
          'success'
        );
        done();
      });
    });

    it('should throw error if review not found when not using backend', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: false });

      service.updateReview('nonexistent', 4, 'Updated content').subscribe({
        next: () => {
          fail('Should not reach here');
        },
        error: (error) => {
          expect(error.message).toBe('Review not found');
          expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
            'Review not found',
            'error'
          );
          done();
        }
      });
    });

    it('should throw error if user does not own the review when not using backend', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: false });

      service.updateReview('2', 4, 'Updated content').subscribe({
        next: () => {
          fail('Should not reach here');
        },
        error: (error) => {
          expect(error.message).toBe('User does not have permission to edit this review');
          expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
            'You do not have permission to edit this review',
            'error'
          );
          done();
        }
      });
    });

    it('should call API and update cache when using backend', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: true });

      const updatedReview: ReviewType = {
        _id: '1',
        userId: 'user1',
        userName: 'John Doe',
        recipeId: RECIPE_ID_1,
        rating: 4,
        content: 'Updated content',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-05-08T00:00:00.000Z'
      };

      reviewApiServiceSpy.updateReview.and.returnValue(of(updatedReview));

      servicePrivate.recipeReviewsCache = {};
      servicePrivate.recipeReviewsCache[RECIPE_ID_1] = [mockReviews[0], mockReviews[1]];

      service.updateReview('1', 4, 'Updated content').subscribe(review => {
        expect(reviewApiServiceSpy.updateReview).toHaveBeenCalledWith('1', 4, 'Updated content');
        const cachedReviews = servicePrivate.recipeReviewsCache[RECIPE_ID_1];
        expect(cachedReviews[0]).toEqual(updatedReview);
        expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
          'Your review has been updated!',
          'success'
        );
        done();
      });
    });

    it('should handle API errors when updating review', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: true });

      spyOn(console, 'error');
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Server error' },
        status: 500,
        statusText: 'Internal Server Error'
      });

      reviewApiServiceSpy.updateReview.and.returnValue(throwError(() => errorResponse));

      service.updateReview('1', 4, 'Updated content').subscribe({
        next: () => {
          fail('Should not reach here');
        },
        error: (error) => {
          expect(console.error).toHaveBeenCalled();
          expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
            'Failed to update review. Please try again later.',
            'error'
          );
          expect(error.message).toBe('Failed to update review');
          done();
        }
      });
    });
  });

  describe('deleteReview', () => {
    it('should throw error if user is not authenticated', (done: DoneFn) => {
      Object.defineProperty(authStoreServiceSpy, 'isAuthenticated', {
        get: () => false
      });

      service.deleteReview('1').subscribe({
        next: () => {
          fail('Should not reach here');
        },
        error: (error) => {
          expect(error.message).toBe('User must be logged in to delete a review');
          expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
            'You must be logged in to delete a review',
            'warning'
          );
          done();
        }
      });
    });

    it('should delete review from subject when not using backend', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: false });

      const initialLength = servicePrivate.reviewsSubject.value.length;

      service.deleteReview('1').subscribe(result => {
        expect(result).toBe(true);
        expect(servicePrivate.reviewsSubject.value.length).toBe(initialLength - 1);
        expect(servicePrivate.reviewsSubject.value.find(r => r._id === '1')).toBeUndefined();
        expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
          'Your review has been deleted',
          'info'
        );
        done();
      });
    });

    it('should throw error if review not found when not using backend', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: false });

      service.deleteReview('nonexistent').subscribe({
        next: () => {
          fail('Should not reach here');
        },
        error: (error) => {
          expect(error.message).toBe('Review not found');
          expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
            'Review not found',
            'error'
          );
          done();
        }
      });
    });

    it('should throw error if user does not own the review when not using backend', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: false });

      service.deleteReview('2').subscribe({
        next: () => {
          fail('Should not reach here');
        },
        error: (error) => {
          expect(error.message).toBe('User does not have permission to delete this review');
          expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
            'You do not have permission to delete this review',
            'error'
          );
          done();
        }
      });
    });

    it('should call API and update cache when using backend', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: true });

      reviewApiServiceSpy.deleteReview.and.returnValue(of(void 0));

      servicePrivate.recipeReviewsCache = {};
      servicePrivate.recipeReviewsCache[RECIPE_ID_1] = [mockReviews[0], mockReviews[1]];

      service.deleteReview('1').subscribe(result => {
        expect(result).toBe(true);
        expect(reviewApiServiceSpy.deleteReview).toHaveBeenCalledWith('1');
        const cachedReviews = servicePrivate.recipeReviewsCache[RECIPE_ID_1];
        expect(cachedReviews.length).toBe(1);
        expect(cachedReviews.find(r => r._id === '1')).toBeUndefined();
        expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
          'Your review has been deleted',
          'info'
        );
        done();
      });
    });

    it('should handle API errors when deleting review', (done: DoneFn) => {
      Object.defineProperty(service, 'useBackend', { value: true });

      spyOn(console, 'error');
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Server error' },
        status: 500,
        statusText: 'Internal Server Error'
      });

      reviewApiServiceSpy.deleteReview.and.returnValue(throwError(() => errorResponse));

      service.deleteReview('1').subscribe({
        next: () => {
          fail('Should not reach here');
        },
        error: (error) => {
          expect(console.error).toHaveBeenCalled();
          expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
            'Failed to delete review. Please try again later.',
            'error'
          );
          expect(error.message).toBe('Failed to delete review');
          done();
        }
      });
    });
  });

  describe('clearCache', () => {
    it('should clear cache for specific recipe', () => {
      servicePrivate.recipeReviewsCache = {};
      servicePrivate.recipeReviewsCache[RECIPE_ID_1] = mockReviews.filter(r => r.recipeId === RECIPE_ID_1);
      servicePrivate.recipeReviewsCache[RECIPE_ID_2] = mockReviews.filter(r => r.recipeId === RECIPE_ID_2);

      service.clearCache(RECIPE_ID_1);

      expect(servicePrivate.recipeReviewsCache[RECIPE_ID_1]).toBeUndefined();
      expect(servicePrivate.recipeReviewsCache[RECIPE_ID_2]).toBeDefined();
    });

    it('should clear entire cache when no recipe ID is provided', () => {
      servicePrivate.recipeReviewsCache = {};
      servicePrivate.recipeReviewsCache[RECIPE_ID_1] = mockReviews.filter(r => r.recipeId === RECIPE_ID_1);
      servicePrivate.recipeReviewsCache[RECIPE_ID_2] = mockReviews.filter(r => r.recipeId === RECIPE_ID_2);

      service.clearCache();

      expect(Object.keys(servicePrivate.recipeReviewsCache).length).toBe(0);
    });
  });

  describe('private methods', () => {
    it('should check if user is authenticated', () => {
      expect(servicePrivate.isUserAuthenticated()).toBeTrue();

      const originalIsAuthenticated = authStoreServiceSpy.isAuthenticated;
      Object.defineProperty(authStoreServiceSpy, 'isAuthenticated', { get: () => false });
      expect(servicePrivate.isUserAuthenticated()).toBeFalse();
      Object.defineProperty(authStoreServiceSpy, 'isAuthenticated', { get: () => originalIsAuthenticated });

      const originalUser = authStoreServiceSpy.currentUser;
      Object.defineProperty(authStoreServiceSpy, 'currentUser', { get: () => null });
      expect(servicePrivate.isUserAuthenticated()).toBeFalse();
      Object.defineProperty(authStoreServiceSpy, 'currentUser', { get: () => originalUser });
    });

    it('should check user authentication and show notification if needed', () => {
      expect(servicePrivate.checkUserAuth()).toBeTrue();
      expect(notificationServiceSpy.showNotification).not.toHaveBeenCalled();

      Object.defineProperty(authStoreServiceSpy, 'isAuthenticated', { get: () => false });
      expect(servicePrivate.checkUserAuth('Test message')).toBeFalse();
      expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith('Test message', 'warning');
    });

    it('should get user info when authenticated', () => {
      const user = servicePrivate.getUser();
      expect(user.id).toBe('user1');
      expect(user.name).toBe('John Doe');
    });

    it('should throw error when getting user info if not authenticated', () => {
      Object.defineProperty(authStoreServiceSpy, 'currentUser', { get: () => null });

      expect(() => servicePrivate.getUser()).toThrowError('User information is not available');
      expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
        'User information is not available',
        'error'
      );
    });

    it('should handle specific API errors', () => {
      spyOn(console, 'error');

      const error403 = new HttpErrorResponse({
        error: { message: 'Forbidden' },
        status: 403,
        statusText: 'Forbidden'
      });

      servicePrivate.handleApiError(error403, 'Test error');
      expect(console.error).toHaveBeenCalled();
      expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
        'You do not have permission for this action',
        'error'
      );

      const error400 = new HttpErrorResponse({
        error: { message: 'User has already reviewed this recipe' },
        status: 400,
        statusText: 'Bad Request'
      });

      servicePrivate.handleApiError(error400, 'Test error');
      expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
        'You have already reviewed this recipe',
        'warning'
      );

      const errorGeneric = new HttpErrorResponse({
        error: { message: 'Server error' },
        status: 500,
        statusText: 'Internal Server Error'
      });

      servicePrivate.handleApiError(errorGeneric, 'Generic test error');
      expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(
        'Generic test error. Please try again later.',
        'error'
      );
    });
  });
});
