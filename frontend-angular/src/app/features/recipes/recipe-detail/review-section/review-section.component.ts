import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewFormComponent } from './review-form/review-form.component';
import { ReviewsListComponent } from './reviews-list/reviews-list.component';
import { AuthStoreService } from '@core/store/auth-store.service';
import { ReviewUIService } from '@features/recipes/recipe-detail/services/review-ui.service';

@Component({
  selector: 'app-review-section',
  standalone: true,
  imports: [CommonModule, ReviewFormComponent, ReviewsListComponent],
  templateUrl: './review-section.component.html',
  providers: [ReviewUIService],
})
export class ReviewSectionComponent implements OnInit {
  @Input() recipeId!: number;
  @Input() isAuthenticated = false;

  constructor(
    public reviewUI: ReviewUIService,
    public authService: AuthStoreService
  ) {}

  ngOnInit(): void {
    this.reviewUI.initialize(this.recipeId.toString());
  }
}
