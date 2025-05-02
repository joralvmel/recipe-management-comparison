import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewType } from '@models/review.model';
import {
  ReviewFormComponent
} from '@features/recipes/recipe-detail/review-section/review-form/review-form.component';
import {
  ReviewsListComponent
} from '@features/recipes/recipe-detail/review-section/reviews-list/reviews-list.component';

@Component({
  selector: 'app-review-section',
  standalone: true,
  imports: [CommonModule, ReviewFormComponent, ReviewsListComponent],
  templateUrl: 'review-section.component.html',
})
export class ReviewSectionComponent {
  @Input() reviews: ReviewType[] = [];
  @Input() recipeId = 0;
  @Input() isAuthenticated = false;
  @Input() currentUserId: string | null = null;
  @Input() hasUserReview = false;
  @Input() userReview: ReviewType | null = null;

  @Input() reviewRating = 0;
  @Input() reviewComment = '';
  @Input() submittingReview = false;

  @Input() editingReviewId: string | null = null;
  @Input() editRating = 0;
  @Input() editComment = '';

  @Output() submitReview = new EventEmitter<{rating: number, comment: string}>();
  @Output() startEditing = new EventEmitter<ReviewType>();
  @Output() cancelEditing = new EventEmitter<void>();
  @Output() saveReview = new EventEmitter<void>();

  onSubmitReview(event: {rating: number, comment: string}): void {
    this.submitReview.emit(event);
  }

  onStartEditing(review: ReviewType): void {
    this.startEditing.emit(review);
  }

  onCancelEditing(): void {
    this.cancelEditing.emit();
  }

  onSaveReview(): void {
    this.saveReview.emit();
  }
}
