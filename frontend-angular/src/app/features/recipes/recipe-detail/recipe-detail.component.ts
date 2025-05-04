import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RecipeDetailService } from '@core/services/recipe-detail.service';
import { FavoriteService } from '@core/services/favorite.service';
import { FavoritesStoreService } from '@core/store/favorites-store.service';
import { ReviewService } from '@core/services/review.service';
import { AuthStoreService } from '@core/store/auth-store.service';
import { RecipeDetailType } from '@models/recipe.model';
import { ReviewType } from '@models/review.model';
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
  ],
})
export class RecipeDetailComponent implements OnInit, OnDestroy {
  recipeId!: number;
  recipe: RecipeDetailType | null = null;
  reviews: ReviewType[] = [];
  isFavorite = false;
  isAuthenticated = false;
  currentUserId: string | null = null;
  loadingFavoriteId: number | null = null;

  hasUserReview = false;
  userReview: ReviewType | null = null;

  reviewRating = 0;
  reviewComment = '';
  submittingReview = false;

  editingReviewId: string | null = null;
  editRating = 0;
  editComment = '';

  servings = 1;
  originalServings = 1;

  isLoading = true;
  error: string | null = null;

  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private recipeDetailService: RecipeDetailService,
    private favoriteService: FavoriteService,
    private favoritesStore: FavoritesStoreService,
    private reviewService: ReviewService,
    private authStore: AuthStoreService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.params.subscribe(params => {
        const idParam = 'id';
        this.recipeId = +params[idParam];
        this.loadRecipe();
      })
    );

    this.subscriptions.add(
      this.authStore.isAuthenticated$.subscribe(isAuth => {
        this.isAuthenticated = isAuth;

        if (this.recipeId) {
          this.checkUserReview();
        }
      })
    );

    this.subscriptions.add(
      this.authStore.user$.subscribe(user => {
        this.currentUserId = user?.id || null;

        if (this.recipeId) {
          this.checkUserReview();
        }
      })
    );

    this.subscriptions.add(
      this.favoriteService.getFavorites().subscribe(favorites => {
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
            this.loadReviews();
            this.checkFavoriteStatus();
            this.checkUserReview();
          } else {
            this.error = 'Recipe not found';
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.error = 'Error loading recipe';
          this.isLoading = false;
          console.error('Error loading recipe:', err);
        }
      })
    );
  }

  loadReviews(): void {
    this.reviewService.getReviewsByRecipeId(this.recipeId.toString()).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.isLoading = false;
      }
    });
  }

  checkUserReview(): void {
    if (this.isAuthenticated) {
      this.reviewService.getUserReviewForRecipe(this.recipeId.toString()).subscribe(review => {
        this.hasUserReview = !!review;
        this.userReview = review || null;

        if (this.hasUserReview && this.userReview && this.editingReviewId === this.userReview._id) {
          this.editRating = this.userReview.rating;
          this.editComment = this.userReview.content;
        }
      });
    } else {
      this.hasUserReview = false;
      this.userReview = null;
    }
  }

  checkFavoriteStatus(): void {
    this.isFavorite = this.favoriteService.isFavorite(this.recipeId);

    this.favoriteService.getFavorites().subscribe(favorites => {
      this.isFavorite = favorites.has(this.recipeId);
    });
  }

  toggleFavorite(recipeId: number = this.recipeId): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/recipe/${this.recipeId}` }
      });
      return;
    }

    this.favoriteService.toggleFavorite(recipeId).subscribe();
  }

  isLoadingFavorite(): boolean {
    return this.loadingFavoriteId === this.recipeId;
  }

  onSubmitReview(event: {rating: number, comment: string}): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/recipe/${this.recipeId}` }
      });
      return;
    }

    this.submittingReview = true;

    this.reviewService.addReview(
      this.recipeId.toString(),
      event.rating,
      event.comment
    ).subscribe({
      next: () => {
        this.reviewRating = 0;
        this.reviewComment = '';
        this.loadReviews();
        this.checkUserReview();
        this.submittingReview = false;
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        this.submittingReview = false;
      }
    });
  }

  onStartEditing(review: ReviewType): void {
    this.editingReviewId = review._id;
    this.editRating = review.rating;
    this.editComment = review.content;
  }

  onCancelEditing(): void {
    this.editingReviewId = null;
  }

  onSaveReview(): void {
    if (!this.editingReviewId) return;

    this.reviewService.updateReview(
      this.editingReviewId,
      this.editRating,
      this.editComment
    ).subscribe({
      next: () => {
        this.editingReviewId = null;
        this.loadReviews();
        this.checkUserReview();
      },
      error: (err) => {
        console.error('Error updating review:', err);
      }
    });
  }

  onDeleteReview(reviewId: string): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.reviewService.deleteReview(reviewId).subscribe({
        next: () => {
          this.loadReviews();
          this.checkUserReview();
        },
        error: (err) => {
          console.error('Error deleting review:', err);
        }
      });
    }
  }

  onServingsChange(newServings: number): void {
    this.servings = newServings;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
