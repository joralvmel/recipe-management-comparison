import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StarRatingComponent } from '@shared/components/star-rating/star-rating.component';
import { AppButtonComponent } from '@shared/components/app-button/app-button.component';
import { ReviewType } from '@models/review.model';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, FormsModule, StarRatingComponent, AppButtonComponent],
  templateUrl: 'review.component.html',
})
export class ReviewComponent {
  @Input() review!: ReviewType;
  @Input() userName = '';
  @Input() canEdit = false;
  @Input() isEditing = false;
  @Input() formattedDate = '';
  @Input() editRating = 0;
  @Input() editComment = '';

  @Output() startEditing = new EventEmitter<ReviewType>();
  @Output() cancelEditing = new EventEmitter<void>();
  @Output() saveReview = new EventEmitter<{rating: number, content: string}>();

  onStartEditing(): void {
    this.startEditing.emit(this.review);
  }

  onCancel(): void {
    this.cancelEditing.emit();
  }

  onSave(): void {
    this.saveReview.emit({
      rating: this.editRating,
      content: this.editComment
    });
  }
}
