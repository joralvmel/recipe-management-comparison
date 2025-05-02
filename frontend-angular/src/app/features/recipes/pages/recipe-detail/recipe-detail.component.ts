import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { RecipeDetailService } from '@core/services/recipe-detail.service';
import { FavoriteService } from '@core/services/favorite.service';
import { ReviewService } from '@core/services/review.service';
import { AuthService } from '@core/services/auth.service';
import { StarRatingComponent } from '@shared/components/star-rating/star-rating.component';
import { AppButtonComponent } from '@shared/components/app-button/app-button.component';
import { RecipeDetailType } from '@models/recipe.model';
import { ReviewType } from '@models/review.model';
import { format } from 'date-fns';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  templateUrl: './recipe-detail.component.html',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    StarRatingComponent,
    AppButtonComponent
  ]
})
export class RecipeDetailComponent implements OnInit {
  recipeId!: number;
  recipe: RecipeDetailType | null = null;
  reviews: ReviewType[] = [];
  isFavorite = false;
  isAuthenticated = false;
  currentUserId: string | null = null;

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

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private recipeDetailService: RecipeDetailService,
    private favoriteService: FavoriteService,
    private reviewService: ReviewService,
    private authService: AuthService
  ) {
    this.isAuthenticated = this.authService.isAuthenticated;
    this.currentUserId = this.authService.currentUser?.id || null;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const idParam = 'id';
      this.recipeId = +params[idParam];
      this.loadRecipe();
    });

    this.authService.getUserObservable().subscribe(user => {
      this.isAuthenticated = !!user;
      this.currentUserId = user?.id || null;

      if (this.recipeId) {
        this.checkUserReview();
      }
    });
  }

  loadRecipe(): void {
    this.isLoading = true;
    this.error = null;

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
    });
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

  toggleFavorite(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/recipe/${this.recipeId}` }
      });
      return;
    }

    this.favoriteService.toggleFavorite(this.recipeId).subscribe();
  }

  submitReview(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/recipe/${this.recipeId}` }
      });
      return;
    }

    if (!this.reviewRating || !this.reviewComment.trim()) {
      return;
    }

    this.submittingReview = true;

    this.reviewService.addReview(
      this.recipeId.toString(),
      this.reviewRating,
      this.reviewComment
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

  startEditingReview(review: ReviewType): void {
    this.editingReviewId = review._id;
    this.editRating = review.rating;
    this.editComment = review.content;
  }

  cancelEditingReview(): void {
    this.editingReviewId = null;
  }

  saveReview(): void {
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

  deleteReview(reviewId: string): void {
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

  increaseServings(): void {
    if (this.servings < 12) {
      this.servings++;
    }
  }

  decreaseServings(): void {
    if (this.servings > 1) {
      this.servings--;
    }
  }

  getScaledAmount(amount: number): number {
    return this.recipeDetailService.getScaledAmount(amount, this.originalServings, this.servings);
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd');
    } catch (e) {
      return dateString;
    }
  }

  canEditReview(review: ReviewType): boolean {
    return this.isAuthenticated && this.currentUserId === review.userId;
  }

  getUserName(userId: string): string {
    if (userId === this.currentUserId) {
      return this.authService.currentUser?.name || 'You';
    }

    const mockUsers = [
      { id: '67b7afeb4165250d67a19c89', name: 'Jorge' },
      { id: '67b8772507009244e16f44c7', name: 'Andres' },
      { id: '67bc2b7598f3df95ab29f8ff', name: 'John' }
    ];

    const user = mockUsers.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  }
}
