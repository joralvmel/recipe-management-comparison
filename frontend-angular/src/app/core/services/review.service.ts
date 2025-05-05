import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ReviewType } from '@models/review.model';
import { reviews } from '@app/data/mock-reviews';
import { AuthService } from './auth.service';
import { ReviewApiService } from '@core/http/review-api.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private reviewsSubject = new BehaviorSubject<ReviewType[]>(reviews);
  private useBackend = process.env.USE_BACKEND === 'true';
  private recipeReviewsCache: { [recipeId: string]: ReviewType[] } = {};

  constructor(
    private authService: AuthService,
    private reviewApiService: ReviewApiService
  ) {}

  getReviewsByRecipeId(recipeId: string): Observable<ReviewType[]> {
    if (this.useBackend) {
      if (this.recipeReviewsCache[recipeId]) {
        return of(this.recipeReviewsCache[recipeId]);
      }

      return this.reviewApiService.getReviewsByRecipeId(recipeId).pipe(
        tap(reviews => {
          this.recipeReviewsCache[recipeId] = reviews;
        }),
        catchError(error => {
          console.error('Error fetching reviews:', error);
          return of([]);
        })
      );
    }

    return this.reviewsSubject.pipe(
      map(reviews => reviews.filter(review => review.recipeId === recipeId))
    );
  }

  hasUserReviewedRecipe(recipeId: string): Observable<boolean> {
    if (!this.authService.isAuthenticated || !this.authService.currentUser) {
      return of(false);
    }

    return this.getUserReviewForRecipe(recipeId).pipe(
      map(review => !!review)
    );
  }

  getUserReviewForRecipe(recipeId: string): Observable<ReviewType | undefined> {
    if (!this.authService.isAuthenticated || !this.authService.currentUser) {
      return of(undefined);
    }

    const userId = this.authService.currentUser.id;

    if (this.useBackend) {
      if (this.recipeReviewsCache[recipeId]) {
        const cachedReview = this.recipeReviewsCache[recipeId]
          .find(review => review.userId === userId);

        if (cachedReview) {
          return of(cachedReview);
        }
      }

      return this.getReviewsByRecipeId(recipeId).pipe(
        map(reviews => reviews.find(review => review.userId === userId))
      );
    }

    return this.reviewsSubject.pipe(
      map(reviews => reviews.find(review =>
        review.recipeId === recipeId && review.userId === userId
      ))
    );
  }

  addReview(recipeId: string, rating: number, content: string): Observable<ReviewType> {
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error('User must be logged in to add a review'));
    }

    const user = this.authService.currentUser;
    if (!user) {
      return throwError(() => new Error('User information is not available'));
    }

    if (this.useBackend) {
      return this.reviewApiService.addReview(recipeId, rating, content).pipe(
        tap(newReview => {
          if (this.recipeReviewsCache[recipeId]) {
            this.recipeReviewsCache[recipeId].push(newReview);
          }
        }),
        catchError(error => {
          console.error('Error adding review:', error);
          if (error.status === 400 && error.error?.message?.includes('already reviewed')) {
            return throwError(() => new Error('You have already reviewed this recipe'));
          }
          return throwError(() => new Error('Failed to add review. Please try again later.'));
        })
      );
    }

    const currentReviews = this.reviewsSubject.value;
    const existingReview = currentReviews.find(r =>
      r.recipeId === recipeId && r.userId === user.id
    );

    if (existingReview) {
      return throwError(() => new Error('User already has a review for this recipe'));
    }

    const newReview: ReviewType = {
      _id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name || 'User',
      recipeId,
      rating,
      content,
      createdAt: new Date().toISOString()
    };

    this.reviewsSubject.next([...currentReviews, newReview]);
    return of(newReview);
  }

  updateReview(reviewId: string, rating: number, content: string): Observable<ReviewType> {
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error('User must be logged in to update a review'));
    }

    const user = this.authService.currentUser;
    if (!user) {
      return throwError(() => new Error('User information is not available'));
    }

    if (this.useBackend) {
      return this.reviewApiService.updateReview(reviewId, rating, content).pipe(
        tap(updatedReview => {
          const recipeId = updatedReview.recipeId;
          if (this.recipeReviewsCache[recipeId]) {
            const index = this.recipeReviewsCache[recipeId]
              .findIndex(r => r._id === reviewId);

            if (index !== -1) {
              this.recipeReviewsCache[recipeId][index] = updatedReview;
            }
          }
        }),
        catchError(error => {
          console.error('Error updating review:', error);
          if (error.status === 403) {
            return throwError(() => new Error('You do not have permission to edit this review'));
          }
          return throwError(() => new Error('Failed to update review. Please try again later.'));
        })
      );
    }

    const currentReviews = this.reviewsSubject.value;
    const reviewIndex = currentReviews.findIndex(r => r._id === reviewId);

    if (reviewIndex === -1) {
      return throwError(() => new Error('Review not found'));
    }

    if (currentReviews[reviewIndex].userId !== user.id) {
      return throwError(() => new Error('User does not have permission to edit this review'));
    }

    const updatedReview: ReviewType = {
      ...currentReviews[reviewIndex],
      rating,
      content,
      updatedAt: new Date().toISOString()
    };

    const updatedReviews = [...currentReviews];
    updatedReviews[reviewIndex] = updatedReview;
    this.reviewsSubject.next(updatedReviews);

    return of(updatedReview);
  }

  deleteReview(reviewId: string): Observable<boolean> {
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error('User must be logged in to delete a review'));
    }

    const user = this.authService.currentUser;
    if (!user) {
      return throwError(() => new Error('User information is not available'));
    }

    if (this.useBackend) {
      return this.reviewApiService.deleteReview(reviewId).pipe(
        map(() => {
          for (const recipeId of Object.keys(this.recipeReviewsCache)) {
            this.recipeReviewsCache[recipeId] = this.recipeReviewsCache[recipeId]
              .filter(review => review._id !== reviewId);
          }
          return true;
        }),
        catchError(error => {
          console.error('Error deleting review:', error);
          if (error.status === 403) {
            return throwError(() => new Error('You do not have permission to delete this review'));
          }
          return throwError(() => new Error('Failed to delete review. Please try again later.'));
        })
      );
    }

    const currentReviews = this.reviewsSubject.value;
    const reviewIndex = currentReviews.findIndex(r => r._id === reviewId);

    if (reviewIndex === -1) {
      return throwError(() => new Error('Review not found'));
    }

    if (currentReviews[reviewIndex].userId !== user.id) {
      return throwError(() => new Error('User does not have permission to delete this review'));
    }

    const updatedReviews = currentReviews.filter(r => r._id !== reviewId);
    this.reviewsSubject.next(updatedReviews);

    return of(true);
  }

  clearCache(recipeId?: string): void {
    if (recipeId) {
      delete this.recipeReviewsCache[recipeId];
    } else {
      this.recipeReviewsCache = {};
    }
  }
}
