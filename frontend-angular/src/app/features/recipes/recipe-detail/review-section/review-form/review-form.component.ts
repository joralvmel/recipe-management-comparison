import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StarRatingComponent } from '@shared/components/star-rating/star-rating.component';
import { AppButtonComponent } from '@shared/components/app-button/app-button.component';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, FormsModule, StarRatingComponent, AppButtonComponent],
  templateUrl: 'review-form.component.html',
})
export class ReviewFormComponent {
  @Input() rating = 0;
  @Input() comment = '';
  @Input() submitting = false;

  @Output() submitReview = new EventEmitter<{rating: number, comment: string}>();

  onSubmit(): void {
    if (!this.rating || !this.comment.trim() || this.submitting) {
      return;
    }

    this.submitReview.emit({
      rating: this.rating,
      comment: this.comment
    });
  }
}
