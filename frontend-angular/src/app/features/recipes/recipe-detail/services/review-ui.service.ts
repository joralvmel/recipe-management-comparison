import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { ReviewType } from '@models/review.model';
import { ReviewService } from '@core/services/review.service';
import { AuthStoreService } from '@core/store/auth-store.service';
import { Router } from '@angular/router';

interface ReviewUIState {
  reviews: ReviewType[];
  userReview: ReviewType | null;
  editingReviewId: string | null;
  editRating: number;
  editComment: string;
  userNameCache: Map<string, string>;
}

const initialState: ReviewUIState = {
  reviews: [],
  userReview: null,
  editingReviewId: null,
  editRating: 0,
  editComment: '',
  userNameCache: new Map<string, string>()
};

@Injectable()
export class ReviewUIService {
  private state = new BehaviorSubject<ReviewUIState>(initialState);
  private recipeId = '';

  readonly reviews$ = this.state.pipe(
    map(state => state.reviews),
    distinctUntilChanged()
  );

  readonly userReview$ = this.state.pipe(
    map(state => state.userReview),
    distinctUntilChanged()
  );

  readonly hasUserReview$ = this.state.pipe(
    map(state => !!state.userReview),
    distinctUntilChanged()
  );

  readonly editingReviewId$ = this.state.pipe(
    map(state => state.editingReviewId),
    distinctUntilChanged()
  );

  readonly editRating$ = this.state.pipe(
    map(state => state.editRating),
    distinctUntilChanged()
  );

  readonly editComment$ = this.state.pipe(
    map(state => state.editComment),
    distinctUntilChanged()
  );

  constructor(
    private reviewService: ReviewService,
    private authService: AuthStoreService,
    private router: Router
  ) {}

  initialize(recipeId: string): void {
    this.recipeId = recipeId;
    this.loadReviews();
    this.checkUserReview();
  }

  loadReviews(): void {
    this.reviewService.getReviewsByRecipeId(this.recipeId).subscribe({
      next: (reviews) => {
        this.updateState({ reviews });
        this.preloadUserNames(reviews);
      },
      error: (err) => console.error('Error loading reviews:', err)
    });
  }

  checkUserReview(): void {
    if (!this.authService.isAuthenticated) return;

    this.reviewService.getUserReviewForRecipe(this.recipeId).subscribe(review => {
      this.updateState({ userReview: review || null });
    });
  }

  startEditing(review: ReviewType): void {
    this.updateState({
      editingReviewId: review._id,
      editRating: review.rating,
      editComment: review.content
    });
  }

  cancelEditing(): void {
    this.updateState({
      editingReviewId: null,
      editRating: 0,
      editComment: ''
    });
  }

  saveReview(reviewId: string, rating: number, content: string): void {
    this.reviewService.updateReview(reviewId, rating, content).subscribe({
      next: () => {
        this.updateState({ editingReviewId: null });
        this.loadReviews();
        this.checkUserReview();
      },
      error: (err) => console.error('Error updating review:', err)
    });
  }

  submitReview(rating: number, comment: string): void {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/recipe/${this.recipeId}` }
      });
      return;
    }

    this.reviewService.addReview(
      this.recipeId,
      rating,
      comment
    ).subscribe({
      next: () => {
        this.loadReviews();
        this.checkUserReview();
      },
      error: (err) => console.error('Error submitting review:', err)
    });
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  }

  getUserName(userId: string): string {
    const cache = this.getCurrentState().userNameCache;

    if (cache.has(userId)) {
      return cache.get(userId) as string;
    }

    this.authService.getUserById(userId).subscribe(user => {
      const newCache = new Map(cache);
      if (user) {
        newCache.set(userId, user.name);
      } else {
        newCache.set(userId, 'Unknown User');
      }
      this.updateState({ userNameCache: newCache });
    });

    return 'Loading...';
  }

  canEditReview(review: ReviewType): boolean {
    return this.authService.isAuthenticated &&
      this.authService.currentUser?.id === review.userId;
  }

  isEditingReview(reviewId: string): boolean {
    return this.getCurrentState().editingReviewId === reviewId;
  }

  getEditRating(): number {
    return this.getCurrentState().editRating;
  }

  getEditComment(): string {
    return this.getCurrentState().editComment;
  }

  private updateState(partialState: Partial<ReviewUIState>): void {
    this.state.next({
      ...this.getCurrentState(),
      ...partialState
    });
  }

  private getCurrentState(): ReviewUIState {
    return this.state.value;
  }

  private preloadUserNames(reviews: ReviewType[]): void {
    const userIds = [...new Set(reviews.map(review => review.userId))];
    const cache = new Map(this.getCurrentState().userNameCache);

    for (const userId of userIds) {
      if (!cache.has(userId)) {
        this.authService.getUserById(userId).subscribe(user => {
          if (user) {
            cache.set(userId, user.name);
          } else {
            cache.set(userId, 'Unknown User');
          }
          this.updateState({ userNameCache: cache });
        });
      }
    }
  }
}
