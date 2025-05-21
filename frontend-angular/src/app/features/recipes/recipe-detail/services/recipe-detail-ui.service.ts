import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { RecipeDetailType } from '@models/recipe.model';
import { RecipeDetailService } from '@core/services/recipe-detail.service';
import { FavoritesStoreService } from '@core/store/favorites-store.service';
import { AuthStoreService } from '@core/store/auth-store.service';
import { Router } from '@angular/router';
import { NotificationService } from '@shared/services/notification.service';

interface RecipeDetailUIState {
  recipeId: number;
  recipe: RecipeDetailType | null;
  isLoading: boolean;
  error: string | null;
  isFavorite: boolean;
  servings: number;
  originalServings: number;
  loadingFavoriteId: number | null;
}

const initialState: RecipeDetailUIState = {
  recipeId: 0,
  recipe: null,
  isLoading: false,
  error: null,
  isFavorite: false,
  servings: 1,
  originalServings: 1,
  loadingFavoriteId: null
};

@Injectable()
export class RecipeDetailUIService {
  private state = new BehaviorSubject<RecipeDetailUIState>(initialState);

  readonly recipe$ = this.state.pipe(
    map(state => state.recipe),
    distinctUntilChanged()
  );

  readonly recipeId$ = this.state.pipe(
    map(state => state.recipeId),
    distinctUntilChanged()
  );

  readonly isLoading$ = this.state.pipe(
    map(state => state.isLoading),
    distinctUntilChanged()
  );

  readonly error$ = this.state.pipe(
    map(state => state.error),
    distinctUntilChanged()
  );

  readonly isFavorite$ = this.state.pipe(
    map(state => state.isFavorite),
    distinctUntilChanged()
  );

  readonly servings$ = this.state.pipe(
    map(state => state.servings),
    distinctUntilChanged()
  );

  readonly originalServings$ = this.state.pipe(
    map(state => state.originalServings),
    distinctUntilChanged()
  );

  readonly loadingFavoriteId$ = this.state.pipe(
    map(state => state.loadingFavoriteId),
    distinctUntilChanged()
  );

  readonly isLoadingFavorite$ = combineLatest([
    this.loadingFavoriteId$,
    this.recipeId$
  ]).pipe(
    map(([loadingId, recipeId]) => loadingId === recipeId)
  );

  readonly title$ = this.recipe$.pipe(
    map(recipe => recipe?.title || '')
  );

  readonly imageUrl$ = this.recipe$.pipe(
    map(recipe => recipe?.image || '')
  );

  readonly ingredients$ = this.recipe$.pipe(
    map(recipe => recipe?.extendedIngredients || [])
  );

  readonly readyInMinutes$ = this.recipe$.pipe(
    map(recipe => recipe?.readyInMinutes || 0)
  );

  readonly healthScore$ = this.recipe$.pipe(
    map(recipe => recipe?.healthScore || 0)
  );

  readonly cuisines$ = this.recipe$.pipe(
    map(recipe => recipe?.cuisines || [])
  );

  readonly dishTypes$ = this.recipe$.pipe(
    map(recipe => recipe?.dishTypes || [])
  );

  readonly diets$ = this.recipe$.pipe(
    map(recipe => recipe?.diets || [])
  );

  readonly instructions$ = this.recipe$.pipe(
    map(recipe => recipe?.analyzedInstructions || [])
  );

  constructor(
    private recipeDetailService: RecipeDetailService,
    private favoritesStore: FavoritesStoreService,
    private authStore: AuthStoreService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.favoritesStore.favoriteIds$.subscribe(favorites => {
      const currentRecipeId = this.getCurrentState().recipeId;
      if (currentRecipeId) {
        this.updateState({ isFavorite: favorites.has(currentRecipeId) });
      }
    });

    this.favoritesStore.loadingRecipeId$.subscribe(id => {
      this.updateState({ loadingFavoriteId: id });
    });
  }

  initialize(recipeId: number): void {
    this.updateState({ recipeId });
    this.loadRecipe();
  }

  loadRecipe(): void {
    const recipeId = this.getCurrentState().recipeId;
    if (!recipeId) return;

    this.updateState({ isLoading: true, error: null });

    this.recipeDetailService.getRecipeById(recipeId).subscribe({
      next: (recipe) => {
        if (recipe) {
          const servings = recipe.servings;
          this.updateState({
            recipe,
            servings,
            originalServings: servings,
            isLoading: false
          });
          this.checkFavoriteStatus();
        } else {
          this.updateState({
            error: 'Recipe not found',
            isLoading: false
          });
          this.notificationService.showNotification('Error fetching recipe detail', 'error');
        }
      },
      error: (err) => {
        this.updateState({
          error: 'Error loading recipe',
          isLoading: false
        });
        console.error('Error loading recipe:', err);
        this.notificationService.showNotification('Error fetching recipe detail', 'error');
      }
    });
  }

  checkFavoriteStatus(): void {
    const recipeId = this.getCurrentState().recipeId;
    const isFavorite = this.favoritesStore.isFavorite(recipeId);
    this.updateState({ isFavorite });
  }

  toggleFavorite(): void {
    if (!this.authStore.isAuthenticated) {
      const recipeId = this.getCurrentState().recipeId;
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/recipe/${recipeId}` }
      });
      return;
    }

    const recipeId = this.getCurrentState().recipeId;
    this.favoritesStore.toggleFavorite(recipeId).subscribe();
  }

  updateServings(servings: number): void {
    this.updateState({ servings });
  }

  getScaledAmount(amount: number): number {
    const { servings, originalServings } = this.getCurrentState();
    return (amount / originalServings) * servings;
  }

  private updateState(partialState: Partial<RecipeDetailUIState>): void {
    this.state.next({
      ...this.getCurrentState(),
      ...partialState
    });
  }

  private getCurrentState(): RecipeDetailUIState {
    return this.state.value;
  }
}
