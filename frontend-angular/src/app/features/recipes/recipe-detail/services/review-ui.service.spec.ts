import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { first } from 'rxjs/operators';
import { ReviewUIService } from './review-ui.service';
import { ReviewService } from '@core/services/review.service';
import { AuthStoreService } from '@core/store/auth-store.service';
import { ReviewType } from '@models/review.model';
import { UserType } from '@models/user.model';

describe('ReviewUIService', () => {
  let service: ReviewUIService;
  let reviewServiceSpy: jasmine.SpyObj<ReviewService>;
  let authServiceSpy: jasmine.SpyObj<AuthStoreService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockRecipeId = 'recipe123';
  const mockUserId = 'user456';
  const mockReviews: ReviewType[] = [
    {
      _id: 'review1',
      userId: mockUserId,
      recipeId: mockRecipeId,
      rating: 5,
      content: 'Excellent recipe! Will make again.',
      createdAt: '2023-05-09T09:45:47.000Z',
      updatedAt: '2023-05-09T09:45:47.000Z'
    },
    {
      _id: 'review2',
      userId: 'otherUser',
      recipeId: mockRecipeId,
      rating: 4,
      content: 'Very good but I added more garlic.',
      createdAt: '2023-05-08T14:30:22.000Z',
      updatedAt: '2023-05-08T14:30:22.000Z'
    }
  ];

  const mockUserReview = mockReviews[0];

  beforeEach(() => {
    reviewServiceSpy = jasmine.createSpyObj('ReviewService', [
      'getReviewsByRecipeId',
      'getUserReviewForRecipe',
      'updateReview',
      'addReview'
    ]);

    authServiceSpy = jasmine.createSpyObj('AuthStoreService', [
      'getUserById'
    ], {
      isAuthenticated: true,
      currentUser: { id: mockUserId, name: 'Test User' }
    });

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    reviewServiceSpy.getReviewsByRecipeId.and.returnValue(of(mockReviews));
    reviewServiceSpy.getUserReviewForRecipe.and.returnValue(of(mockUserReview));
    reviewServiceSpy.updateReview.and.returnValue(of({
      _id: 'review1',
      userId: mockUserId,
      recipeId: mockRecipeId,
      rating: 5,
      content: 'Excellent recipe! Will make again.',
      createdAt: '2023-05-09T09:45:47.000Z',
      updatedAt: '2023-05-09T09:45:47.000Z'
    }));
    reviewServiceSpy.addReview.and.returnValue(of({
      _id: 'review1',
      userId: mockUserId,
      recipeId: mockRecipeId,
      rating: 5,
      content: 'Excellent recipe! Will make again.',
      createdAt: '2023-05-09T09:45:47.000Z',
      updatedAt: '2023-05-09T09:45:47.000Z'
    }));

    authServiceSpy.getUserById.and.callFake((userId: string) => {
      if (userId === mockUserId) {
        const user: UserType = {
          id: mockUserId,
          name: 'Test User',
          email: 'test@example.com',
          createdAt: new Date('2023-05-01T00:00:00.000Z').getTime()
        };
        return of(user);
      }

      if (userId === 'otherUser') {
        const user: UserType = {
          id: 'otherUser',
          name: 'Other User',
          email: 'other@example.com',
          createdAt: new Date('2023-05-02T00:00:00.000Z').getTime()
        };
        return of(user);
      }

      return of(null);
    });

    TestBed.configureTestingModule({
      providers: [
        ReviewUIService,
        { provide: ReviewService, useValue: reviewServiceSpy },
        { provide: AuthStoreService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(ReviewUIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load reviews and check user review on initialize', () => {
      spyOn(service, 'loadReviews');
      spyOn(service, 'checkUserReview');

      service.initialize(mockRecipeId);

      expect(service.loadReviews).toHaveBeenCalled();
      expect(service.checkUserReview).toHaveBeenCalled();
    });
  });

  describe('loadReviews', () => {
    it('should fetch reviews and update state', () => {
      service.initialize(mockRecipeId);

      service.reviews$.pipe(first()).subscribe(reviews => {
        expect(reviews).toEqual(mockReviews);
        expect(reviews.length).toBe(2);
      });

      expect(reviewServiceSpy.getReviewsByRecipeId).toHaveBeenCalledWith(mockRecipeId);
    });

    it('should preload user names for reviews', () => {
      service.initialize(mockRecipeId);

      expect(authServiceSpy.getUserById).toHaveBeenCalledWith(mockUserId);
      expect(authServiceSpy.getUserById).toHaveBeenCalledWith('otherUser');
    });

    it('should handle error when loading reviews', () => {
      reviewServiceSpy.getReviewsByRecipeId.and.returnValue(throwError(() => new Error('Network error')));

      spyOn(console, 'error');
      service.initialize(mockRecipeId);

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('checkUserReview', () => {
    it('should set userReview when authenticated user has a review', () => {
      service.initialize(mockRecipeId);

      service.userReview$.pipe(first()).subscribe(review => {
        expect(review).toEqual(mockUserReview);
      });

      service.hasUserReview$.pipe(first()).subscribe(hasReview => {
        expect(hasReview).toBeTrue();
      });

      expect(reviewServiceSpy.getUserReviewForRecipe).toHaveBeenCalledWith(mockRecipeId);
    });

    it('should not check for user review when not authenticated', () => {
      Object.defineProperty(authServiceSpy, 'isAuthenticated', { get: () => false });

      service.initialize(mockRecipeId);

      expect(reviewServiceSpy.getUserReviewForRecipe).not.toHaveBeenCalled();
    });

    it('should handle null review result', () => {
      reviewServiceSpy.getUserReviewForRecipe.and.returnValue(of(undefined));

      service.initialize(mockRecipeId);

      service.hasUserReview$.pipe(first()).subscribe(hasReview => {
        expect(hasReview).toBeFalse();
      });
    });
  });

  describe('editing functionality', () => {
    beforeEach(() => {
      service.initialize(mockRecipeId);
    });

    it('should start editing with correct values', () => {
      service.startEditing(mockUserReview);

      service.editingReviewId$.pipe(first()).subscribe(id => {
        expect(id).toBe(mockUserReview._id);
      });

      service.editRating$.pipe(first()).subscribe(rating => {
        expect(rating).toBe(mockUserReview.rating);
      });

      service.editComment$.pipe(first()).subscribe(comment => {
        expect(comment).toBe(mockUserReview.content);
      });

      expect(service.isEditingReview(mockUserReview._id)).toBeTrue();
      expect(service.getEditRating()).toBe(mockUserReview.rating);
      expect(service.getEditComment()).toBe(mockUserReview.content);
    });

    it('should cancel editing', () => {
      service.startEditing(mockUserReview);
      service.cancelEditing();

      service.editingReviewId$.pipe(first()).subscribe(id => {
        expect(id).toBeNull();
      });

      expect(service.isEditingReview(mockUserReview._id)).toBeFalse();
    });

    it('should save review and reload data', () => {
      const updatedRating = 4;
      const updatedContent = 'Updated review content';

      service.saveReview(mockUserReview._id, updatedRating, updatedContent);

      expect(reviewServiceSpy.updateReview).toHaveBeenCalledWith(
        mockUserReview._id,
        updatedRating,
        updatedContent
      );

      expect(reviewServiceSpy.getReviewsByRecipeId).toHaveBeenCalledTimes(2);
      expect(reviewServiceSpy.getUserReviewForRecipe).toHaveBeenCalledTimes(2);
    });

    it('should handle error when saving review', () => {
      reviewServiceSpy.updateReview.and.returnValue(throwError(() => new Error('Update error')));

      spyOn(console, 'error');
      service.saveReview(mockUserReview._id, 3, 'Updated content');

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('submitReview', () => {
    beforeEach(() => {
      service.initialize(mockRecipeId);
    });

    it('should add new review when authenticated', () => {
      const newRating = 5;
      const newComment = 'Great recipe!';

      service.submitReview(newRating, newComment);

      expect(reviewServiceSpy.addReview).toHaveBeenCalledWith(
        mockRecipeId,
        newRating,
        newComment
      );

      expect(reviewServiceSpy.getReviewsByRecipeId).toHaveBeenCalledTimes(2);
      expect(reviewServiceSpy.getUserReviewForRecipe).toHaveBeenCalledTimes(2);
    });

    it('should navigate to login when not authenticated', () => {
      Object.defineProperty(authServiceSpy, 'isAuthenticated', { get: () => false });

      service.submitReview(5, 'Great recipe!');

      expect(routerSpy.navigate).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: `/recipe/${mockRecipeId}` } }
      );

      expect(reviewServiceSpy.addReview).not.toHaveBeenCalled();
    });

    it('should handle error when submitting review', () => {
      reviewServiceSpy.addReview.and.returnValue(throwError(() => new Error('Submission error')));

      spyOn(console, 'error');
      service.submitReview(5, 'Great recipe!');

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('utility methods', () => {
    beforeEach(() => {
      service.initialize(mockRecipeId);
    });

    it('should format date correctly', () => {
      const date = '2023-05-09T09:45:47.000Z';
      expect(service.formatDate(date)).toBe(new Date(date).toLocaleDateString());
    });

    it('should handle invalid date format', () => {
      const invalidDate = 'not-a-date';
      expect(service.formatDate(invalidDate)).toBe('Invalid Date');
    });

    it('should get user name from cache if available', () => {
      expect(service.getUserName(mockUserId)).toBe('Test User');
      expect(authServiceSpy.getUserById).toHaveBeenCalledWith(mockUserId);

      authServiceSpy.getUserById.calls.reset();

      expect(service.getUserName(mockUserId)).toBe('Test User');
      expect(authServiceSpy.getUserById).not.toHaveBeenCalled();
    });

    it('should handle unknown user', () => {
      authServiceSpy.getUserById.and.returnValue(of(null));

      expect(service.getUserName('unknownUser')).toBe('Loading...');

      service.reviews$.pipe(first()).subscribe(() => {
        expect(service.getUserName('unknownUser')).toBe('Unknown User');
      });
    });

    it('should determine if user can edit review', () => {
      expect(service.canEditReview(mockUserReview)).toBeTrue();
      expect(service.canEditReview(mockReviews[1])).toBeFalse();

      Object.defineProperty(authServiceSpy, 'isAuthenticated', { get: () => false });
      expect(service.canEditReview(mockUserReview)).toBeFalse();
    });
  });
});
