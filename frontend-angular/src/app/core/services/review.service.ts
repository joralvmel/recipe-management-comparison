import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, tap, finalize } from 'rxjs/operators';
import { ReviewType } from '@models/review.model';
import { reviews } from '@app/data/mock-reviews';
import { AuthStoreService } from '@core/store/auth-store.service';
import { ReviewApiService } from '@core/http/review-api.service';
import { NotificationService } from '@shared/services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private reviewsSubject = new BehaviorSubject<ReviewType[]>(reviews);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private useBackend = process.env.USE_BACKEND === 'true';
  private recipeReviewsCache: { [recipeId: string]: ReviewType[] } = {};

  readonly loading$ = this.loadingSubject.asObservable();

  constructor(
    private authStore: AuthStoreService,
    private reviewApiService: ReviewApiService,
    private notificationService: NotificationService
  ) {}

  getReviewsByRecipeId(recipeId: string): Observable<ReviewType[]> {
    this.loadingSubject.next(true);

    if (this.useBackend) {
      if (this.recipeReviewsCache[recipeId]) {
        this.loadingSubject.next(false);
        return of(this.recipeReviewsCache[recipeId]);
      }

      return this.reviewApiService.getReviewsByRecipeId(recipeId).pipe(
        tap(reviews => {
          this.recipeReviewsCache[recipeId] = reviews;
        }),
        catchError(error => {
          console.error('Error fetching reviews:', error);
          this.notificationService.showNotification('Unable to load reviews. Please try again later.', 'error');
          return of([]);
        }),
        finalize(() => this.loadingSubject.next(false))
      );
    }

    return of(this.reviewsSubject.value.filter(review => review.recipeId === recipeId))
      .pipe(finalize(() => this.loadingSubject.next(false)));
  }

  getUserReviewForRecipe(recipeId: string): Observable<ReviewType | undefined> {
    if (!this.isUserAuthenticated()) return of(undefined);

    const user = this.authStore.currentUser;
    if (!user) return of(undefined);
    const userId = user.id;

    if (this.useBackend) {
      if (this.recipeReviewsCache[recipeId]) {
        const cachedReview = this.recipeReviewsCache[recipeId]
          .find(review => review.userId === userId);
        if (cachedReview) return of(cachedReview);
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
    if (!this.checkUserAuth('You must be logged in to add a review')) {
      return throwError(() => new Error('User must be logged in to add a review'));
    }

    const user = this.getUser();
    this.loadingSubject.next(true);

    if (this.useBackend) {
      return this.reviewApiService.addReview(recipeId, rating, content).pipe(
        tap(newReview => {
          if (this.recipeReviewsCache[recipeId]) {
            this.recipeReviewsCache[recipeId].push(newReview);
          }
          this.notificationService.showNotification('Your review has been added!', 'success');
        }),
        catchError(error => {
          this.handleApiError(error, 'Failed to add review');
          return throwError(() => new Error('Failed to add review'));
        }),
        finalize(() => this.loadingSubject.next(false))
      );
    }

    const currentReviews = this.reviewsSubject.value;
    const existingReview = currentReviews.find(r =>
      r.recipeId === recipeId && r.userId === user.id
    );

    if (existingReview) {
      this.notificationService.showNotification('You have already reviewed this recipe', 'warning');
      this.loadingSubject.next(false);
      return throwError(() => new Error('User already has a review for this recipe'));
    }

    const newReview: ReviewType = {
      _id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      recipeId,
      rating,
      content,
      createdAt: new Date().toISOString()
    };

    this.reviewsSubject.next([...currentReviews, newReview]);
    this.notificationService.showNotification('Your review has been added!', 'success');
    this.loadingSubject.next(false);
    return of(newReview);
  }

  updateReview(reviewId: string, rating: number, content: string): Observable<ReviewType> {
    if (!this.checkUserAuth('You must be logged in to update a review')) {
      return throwError(() => new Error('User must be logged in to update a review'));
    }

    const user = this.getUser();
    this.loadingSubject.next(true);

    if (this.useBackend) {
      return this.reviewApiService.updateReview(reviewId, rating, content).pipe(
        tap(updatedReview => {
          const recipeId = updatedReview.recipeId;
          if (this.recipeReviewsCache[recipeId]) {
            const index = this.recipeReviewsCache[recipeId].findIndex(r => r._id === reviewId);
            if (index !== -1) this.recipeReviewsCache[recipeId][index] = updatedReview;
          }
          this.notificationService.showNotification('Your review has been updated!', 'success');
        }),
        catchError(error => {
          this.handleApiError(error, 'Failed to update review');
          return throwError(() => new Error('Failed to update review'));
        }),
        finalize(() => this.loadingSubject.next(false))
      );
    }

    const currentReviews = this.reviewsSubject.value;
    const reviewIndex = currentReviews.findIndex(r => r._id === reviewId);

    if (reviewIndex === -1) {
      this.notificationService.showNotification('Review not found', 'error');
      this.loadingSubject.next(false);
      return throwError(() => new Error('Review not found'));
    }

    if (currentReviews[reviewIndex].userId !== user.id) {
      this.notificationService.showNotification('You do not have permission to edit this review', 'error');
      this.loadingSubject.next(false);
      return throwError(() => new Error('User does not have permission to edit this review'));
    }

    const updatedReview = {
      ...currentReviews[reviewIndex],
      rating,
      content,
      updatedAt: new Date().toISOString()
    };

    const updatedReviews = [...currentReviews];
    updatedReviews[reviewIndex] = updatedReview;
    this.reviewsSubject.next(updatedReviews);

    this.notificationService.showNotification('Your review has been updated!', 'success');
    this.loadingSubject.next(false);
    return of(updatedReview);
  }

  deleteReview(reviewId: string): Observable<boolean> {
    if (!this.checkUserAuth('You must be logged in to delete a review')) {
      return throwError(() => new Error('User must be logged in to delete a review'));
    }

    const user = this.getUser();
    this.loadingSubject.next(true);

    if (this.useBackend) {
      return this.reviewApiService.deleteReview(reviewId).pipe(
        map(() => {
          for (const recipeId of Object.keys(this.recipeReviewsCache)) {
            this.recipeReviewsCache[recipeId] =
              this.recipeReviewsCache[recipeId].filter(r => r._id !== reviewId);
          }
          this.notificationService.showNotification('Your review has been deleted', 'info');
          return true;
        }),
        catchError(error => {
          this.handleApiError(error, 'Failed to delete review');
          return throwError(() => new Error('Failed to delete review'));
        }),
        finalize(() => this.loadingSubject.next(false))
      );
    }

    const currentReviews = this.reviewsSubject.value;
    const reviewIndex = currentReviews.findIndex(r => r._id === reviewId);

    if (reviewIndex === -1) {
      this.notificationService.showNotification('Review not found', 'error');
      this.loadingSubject.next(false);
      return throwError(() => new Error('Review not found'));
    }

    if (currentReviews[reviewIndex].userId !== user.id) {
      this.notificationService.showNotification('You do not have permission to delete this review', 'error');
      this.loadingSubject.next(false);
      return throwError(() => new Error('User does not have permission to delete this review'));
    }

    this.reviewsSubject.next(currentReviews.filter(r => r._id !== reviewId));
    this.notificationService.showNotification('Your review has been deleted', 'info');
    this.loadingSubject.next(false);
    return of(true);
  }

  clearCache(recipeId?: string): void {
    if (recipeId) {
      delete this.recipeReviewsCache[recipeId];
    } else {
      this.recipeReviewsCache = {};
    }
  }

  private handleApiError(error: HttpErrorResponse, defaultMessage: string): void {
    console.error('API Error:', error);

    if (error.status === 403) {
      this.notificationService.showNotification('You do not have permission for this action', 'error');
    } else if (error.status === 400 && error.error?.message?.includes('already reviewed')) {
      this.notificationService.showNotification('You have already reviewed this recipe', 'warning');
    } else {
      this.notificationService.showNotification(`${defaultMessage}. Please try again later.`, 'error');
    }
  }

  private isUserAuthenticated(): boolean {
    return this.authStore.isAuthenticated && !!this.authStore.currentUser;
  }

  private checkUserAuth(errorMessage?: string): boolean {
    const isAuth = this.isUserAuthenticated();
    if (!isAuth && errorMessage) {
      this.notificationService.showNotification(errorMessage, 'warning');
    }
    return isAuth;
  }

  private getUser(): { id: string, name: string } {
    const user = this.authStore.currentUser;
    if (!user) {
      this.notificationService.showNotification('User information is not available', 'error');
      throw new Error('User information is not available');
    }
    return { id: user.id, name: user.name || 'User' };
  }
}
