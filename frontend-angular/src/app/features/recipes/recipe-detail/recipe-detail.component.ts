import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { RecipeDetailService } from '@core/services/recipe-detail.service';
import { FavoritesStoreService } from '@core/store/favorites-store.service';
import { AuthStoreService } from '@core/store/auth-store.service';
import { RecipeDetailType } from '@models/recipe.model';
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
import { NotificationService } from '@shared/services/notification.service';

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
})
export class RecipeDetailComponent implements OnInit, OnDestroy {
  recipeId!: number;
  recipe: RecipeDetailType | null = null;
  isFavorite = false;
  isAuthenticated = false;
  loadingFavoriteId: number | null = null;
  servings = 1;
  originalServings = 1;
  isLoading = true;
  error: string | null = null;

  private recipeIdSubject = new BehaviorSubject<number | null>(null);
  showReviewSection$: Observable<boolean>;

  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private recipeDetailService: RecipeDetailService,
    private favoritesStore: FavoritesStoreService,
    private authStore: AuthStoreService,
    private reviewService: ReviewService,
    private notificationService: NotificationService
  ) {
    this.showReviewSection$ = combineLatest([
      this.authStore.isAuthenticated$,
      this.recipeIdSubject.pipe(
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
        this.recipeId = +params[idParam];
        this.recipeIdSubject.next(this.recipeId);
        this.loadRecipe();
      })
    );

    this.subscriptions.add(
      this.authStore.isAuthenticated$.subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      })
    );

    this.subscriptions.add(
      this.favoritesStore.favoriteIds$.subscribe(favorites => {
        this.isFavorite = favorites.has(this.recipeId);
      })
    );

    this.subscriptions.add(
      this.favoritesStore.loadingRecipeId$.subscribe(id => {
        this.loadingFavoriteId = id;
      })
    );
  }

  loadRecipe(): void {
    this.isLoading = true;
    this.error = null;

    this.subscriptions.add(
      this.recipeDetailService.getRecipeById(this.recipeId).subscribe({
        next: (recipe) => {
          if (recipe) {
            this.recipe = recipe;
            this.servings = recipe.servings;
            this.originalServings = recipe.servings;
            this.checkFavoriteStatus();
            this.isLoading = false;
          } else {
            this.error = 'Recipe not found';
            this.isLoading = false;
            this.notificationService.showNotification('Error fetching recipe detail from backend', 'error');
          }
        },
        error: (err) => {
          this.error = 'Error loading recipe';
          this.isLoading = false;
          console.error('Error loading recipe:', err);
          this.notificationService.showNotification('Error fetching recipe detail from backend', 'error');
        }
      })
    );
  }

  checkFavoriteStatus(): void {
    this.isFavorite = this.favoritesStore.isFavorite(this.recipeId);
  }

  toggleFavorite(recipeId: number = this.recipeId): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/recipe/${this.recipeId}` }
      });
      return;
    }

    this.favoritesStore.toggleFavorite(recipeId).subscribe();
  }

  isLoadingFavorite(): boolean {
    return this.loadingFavoriteId === this.recipeId;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
