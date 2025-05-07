import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StarRatingComponent } from '@shared/components/star-rating/star-rating.component';
import { AppButtonComponent } from '@shared/components/app-button/app-button.component';
import { ReviewType } from '@models/review.model';
import { ReviewUIService } from '../../../services/review-ui.service';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, FormsModule, StarRatingComponent, AppButtonComponent],
  templateUrl: 'review.component.html'
})
export class ReviewComponent implements OnInit {
  @Input() review!: ReviewType;

  editRating = 0;
  editComment = '';

  constructor(public reviewUI: ReviewUIService) {}

  ngOnInit(): void {
    this.reviewUI.editingReviewId$.subscribe(id => {
      if (id === this.review._id) {
        this.editRating = this.reviewUI.getEditRating();
        this.editComment = this.reviewUI.getEditComment();
      }
    });
  }

  get isEditing(): boolean {
    return this.reviewUI.isEditingReview(this.review._id);
  }

  get userName(): string {
    return this.reviewUI.getUserName(this.review.userId);
  }

  get formattedDate(): string {
    return this.reviewUI.formatDate(this.review.createdAt);
  }

  get canEdit(): boolean {
    return this.reviewUI.canEditReview(this.review);
  }

  onStartEditing(): void {
    this.reviewUI.startEditing(this.review);
  }

  onCancel(): void {
    this.reviewUI.cancelEditing();
  }

  onSave(): void {
    this.reviewUI.saveReview(this.review._id, this.editRating, this.editComment);
  }
}
