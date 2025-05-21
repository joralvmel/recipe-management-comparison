import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewType } from '@models/review.model';
import { ReviewComponent } from './review/review.component';
import { ReviewUIService } from '@features/recipes/recipe-detail/services/review-ui.service';

@Component({
  selector: 'app-reviews-list',
  standalone: true,
  imports: [CommonModule, ReviewComponent],
  templateUrl: 'reviews-list.component.html',
})
export class ReviewsListComponent {
  @Input() reviews: ReviewType[] = [];

  constructor(public reviewUI: ReviewUIService) {}
}
