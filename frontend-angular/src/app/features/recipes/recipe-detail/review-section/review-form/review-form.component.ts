import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StarRatingComponent } from '@shared/components/star-rating/star-rating.component';
import { AppButtonComponent } from '@shared/components/app-button/app-button.component';
import { ReviewUIService } from '../../services/review-ui.service';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, FormsModule, StarRatingComponent, AppButtonComponent],
  templateUrl: 'review-form.component.html',
})
export class ReviewFormComponent {
  rating = 0;
  comment = '';
  submitting = false;

  constructor(
    private reviewUI: ReviewUIService,
  ) {}

  onSubmit(): void {
    if (!this.rating || !this.comment.trim() || this.submitting) {
      return;
    }

    this.submitting = true;
    this.reviewUI.submitReview(this.rating, this.comment);
    this.submitting = false;
    this.rating = 0;
    this.comment = '';
  }
}
