import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.component.html',
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Input() readOnly = false;
  @Output() ratingChange = new EventEmitter<number>();

  stars = [5, 4, 3, 2, 1];

  onStarClick(rating: number): void {
    if (this.readOnly) return;

    this.rating = this.rating === rating ? 0 : rating;
    this.ratingChange.emit(this.rating);
  }
}
