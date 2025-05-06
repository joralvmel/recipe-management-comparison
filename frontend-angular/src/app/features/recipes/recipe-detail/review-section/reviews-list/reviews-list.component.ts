import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewType } from '@models/review.model';
import { AuthStoreService } from '@core/store/auth-store.service';
import {
  ReviewComponent
} from '@features/recipes/recipe-detail/review-section/reviews-list/review/review.component';

@Component({
  selector: 'app-reviews-list',
  standalone: true,
  imports: [CommonModule, ReviewComponent],
  templateUrl: 'reviews-list.component.html',
})
export class ReviewsListComponent implements OnInit {
  @Input() reviews: ReviewType[] = [];
  @Input() editingReviewId: string | null = null;
  @Input() editRating = 0;
  @Input() editComment = '';
  @Input() currentUserId: string | null = null;
  @Input() isAuthenticated = false;

  @Output() startEditing = new EventEmitter<ReviewType>();
  @Output() cancelEditing = new EventEmitter<void>();
  @Output() saveReview = new EventEmitter<{rating: number, content: string}>();

  userNameCache: Map<string, string> = new Map();

  constructor(private authStore: AuthStoreService) {}

  ngOnInit(): void {
    this.preloadUserNames();
  }

  preloadUserNames(): void {
    const userIds = [...new Set(this.reviews.map(review => review.userId))];

    for (const userId of userIds) {
      this.authStore.getUserById(userId).subscribe(user => {
        if (user) {
          this.userNameCache.set(userId, user.name);
        } else {
          this.userNameCache.set(userId, 'Unknown User');
        }
      });
    }
  }

  onStartEditing(review: ReviewType): void {
    this.startEditing.emit(review);
  }

  onCancelEditing(): void {
    this.cancelEditing.emit();
  }

  onSaveReview(event: { rating: number; content: string }): void {
    this.saveReview.emit(event);
  }

  canEditReview(review: ReviewType): boolean {
    return this.isAuthenticated && this.currentUserId === review.userId;
  }

  getUserName(userId: string): string {
    if (this.userNameCache.has(userId)) {
      return this.userNameCache.get(userId) as string;
    }

    this.authStore.getUserById(userId).subscribe(user => {
      if (user) {
        this.userNameCache.set(userId, user.name);
      } else {
        this.userNameCache.set(userId, 'Unknown User');
      }
    });

    return this.userNameCache.get(userId) || 'Loading...';
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (e) {
      return dateString;
    }
  }
}
