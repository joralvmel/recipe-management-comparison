import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReviewType } from '@models/review.model';
import { reviews } from '@app/data/mock-reviews';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private reviewsSubject = new BehaviorSubject<ReviewType[]>(reviews);

  constructor(private authService: AuthService) {}

  getReviewsByRecipeId(recipeId: string): Observable<ReviewType[]> {
    return this.reviewsSubject.pipe(
      map(reviews => reviews.filter(review => review.recipeId === recipeId))
    );
  }

  hasUserReviewedRecipe(recipeId: string): Observable<boolean> {
    if (!this.authService.isAuthenticated || !this.authService.currentUser) {
      return of(false);
    }

    const userId = this.authService.currentUser.id;
    return this.reviewsSubject.pipe(
      map(reviews => reviews.some(review =>
        review.recipeId === recipeId && review.userId === userId
      ))
    );
  }

  getUserReviewForRecipe(recipeId: string): Observable<ReviewType | undefined> {
    if (!this.authService.isAuthenticated || !this.authService.currentUser) {
      return of(undefined);
    }

    const userId = this.authService.currentUser.id;
    return this.reviewsSubject.pipe(
      map(reviews => reviews.find(review =>
        review.recipeId === recipeId && review.userId === userId
      ))
    );
  }

  addReview(recipeId: string, rating: number, content: string): Observable<ReviewType> {
    if (!this.authService.isAuthenticated) {
      throw new Error('User must be logged in to add a review');
    }

    const user = this.authService.currentUser;
    if (!user) {
      throw new Error('User information is not available');
    }

    const currentReviews = this.reviewsSubject.value;
    const existingReview = currentReviews.find(r =>
      r.recipeId === recipeId && r.userId === user.id
    );

    if (existingReview) {
      throw new Error('User already has a review for this recipe');
    }

    const newReview: ReviewType = {
      _id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
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
      throw new Error('User must be logged in to update a review');
    }

    const user = this.authService.currentUser;
    if (!user) {
      throw new Error('User information is not available');
    }
    const currentReviews = this.reviewsSubject.value;
    const reviewIndex = currentReviews.findIndex(r => r._id === reviewId);

    if (reviewIndex === -1) {
      throw new Error('Review not found');
    }

    if (currentReviews[reviewIndex].userId !== user.id) {
      throw new Error('User does not have permission to edit this review');
    }

    const updatedReview: ReviewType = {
      ...currentReviews[reviewIndex],
      rating,
      content,
      createdAt: new Date().toISOString()
    };

    const updatedReviews = [...currentReviews];
    updatedReviews[reviewIndex] = updatedReview;
    this.reviewsSubject.next(updatedReviews);

    return of(updatedReview);
  }

  deleteReview(reviewId: string): Observable<boolean> {
    if (!this.authService.isAuthenticated) {
      throw new Error('User must be logged in to delete a review');
    }

    const user = this.authService.currentUser;
    if (!user) {
      throw new Error('User information is not available');
    }
    const currentReviews = this.reviewsSubject.value;
    const reviewIndex = currentReviews.findIndex(r => r._id === reviewId);

    if (reviewIndex === -1) {
      throw new Error('Review not found');
    }

    if (currentReviews[reviewIndex].userId !== user.id) {
      throw new Error('User does not have permission to delete this review');
    }

    const updatedReviews = currentReviews.filter(r => r._id !== reviewId);
    this.reviewsSubject.next(updatedReviews);

    return of(true);
  }
}
