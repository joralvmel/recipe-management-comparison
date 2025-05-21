import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Observable, Subscription, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthStoreService } from '@core/store/auth-store.service';
import { ReviewService } from '@core/services/review.service';
import {
  RecipeMainSectionComponent
} from '@features/recipes/recipe-detail/recipe-main-section/recipe-main-section.component';
import {
  RecipeSectionComponent
} from '@features/recipes/recipe-detail/recipe-section/recipe-section.component';
import {
  ReviewSectionComponent
} from '@features/recipes/recipe-detail/review-section/review-section.component';
import {
  RecipeHeaderComponent
} from '@features/recipes/recipe-detail/recipe-header/recipe-header.component';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { RecipeDetailUIService } from '@features/recipes/recipe-detail/services/recipe-detail-ui.service';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  templateUrl: './recipe-detail.component.html',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RecipeMainSectionComponent,
    RecipeSectionComponent,
    ReviewSectionComponent,
    RecipeHeaderComponent,
    LoaderComponent,
  ],
  providers: [RecipeDetailUIService]
})
export class RecipeDetailComponent implements OnInit, OnDestroy {
  showReviewSection$: Observable<boolean>;
  private subscriptions = new Subscription();

  constructor(
    public recipeUI: RecipeDetailUIService,
    private route: ActivatedRoute,
    public authService: AuthStoreService,
    private reviewService: ReviewService
  ) {
    this.showReviewSection$ = combineLatest([
      this.authService.isAuthenticated$,
      this.recipeUI.recipeId$.pipe(
        switchMap(id => id ? this.reviewService.getReviewsByRecipeId(id.toString()) : of([]))
      )
    ]).pipe(
      map(([isAuthenticated, reviews]) => {
        return isAuthenticated || reviews.length > 0;
      })
    );
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.params.subscribe(params => {
        const idParam = 'id';
        const recipeId = +params[idParam];
        this.recipeUI.initialize(recipeId);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
