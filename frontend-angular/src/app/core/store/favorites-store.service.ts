import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { map, catchError, finalize, switchMap } from 'rxjs/operators';
import { RecipeType, RecipeDetailType } from '@models/recipe.model';
import { recipes } from '@app/data/mock-recipes';
import { favoriteData } from '@app/data/mock-favorites';
import { AuthStoreService } from '@core/store/auth-store.service';
import { FavoriteApiService } from '@core/http/favorite-api.service';
import { RecipeDetailApiService } from '@core/http/recipe-detail-api.service';
import { NotificationService } from '@shared/services/notification.service';

export interface FavoritesState {
  favoriteIds: Set<number>;
  loading: boolean;
  loadingRecipeId: number | null;
}

const initialState: FavoritesState = {
  favoriteIds: new Set<number>(),
  loading: false,
  loadingRecipeId: null
};

export interface FavoriteSearchResponse {
  results: RecipeType[];
  total: number;
  totalPages: number;
  page: number;
}

@Injectable({ providedIn: 'root' })
export class FavoritesStoreService {
  private readonly BASE_STORAGE_KEY = 'favorites_';
  private favoritesSubject = new BehaviorSubject<FavoritesState>(initialState);
  private state$: Observable<FavoritesState> = this.favoritesSubject.asObservable();
  private useBackend = process.env.USE_BACKEND === 'true';

  constructor(
    private authStore: AuthStoreService,
    private favoriteApiService: FavoriteApiService,
    private recipeDetailApiService: RecipeDetailApiService,
    private notificationService: NotificationService
  ) {
    this.authStore.user$.subscribe(user => {
      if (user) {
        this.loadUserFavorites(user.id);
      } else {
        this.clearFavorites();
      }
    });
  }

  private loadUserFavorites(userId: string): void {
    this.updateState({ loading: true });

    if (this.useBackend) {
      this.loadFavoritesFromApi();
    } else {
      this.loadFavoritesFromLocal(userId);
    }
  }

  private loadFavoritesFromApi(): void {
    this.favoriteApiService.getFavorites().pipe(
      catchError(error => {
        console.error('Error loading favorites from API:', error);
        this.notificationService.showNotification('Failed to load favorites', 'error');
        return of([]);
      }),
      finalize(() => this.updateState({ loading: false }))
    ).subscribe(response => {
      this.updateState({
        favoriteIds: new Set<number>(response.map(fav => Number(fav.recipeId)))
      });
    });
  }

  private loadFavoritesFromLocal(userId: string): void {
    try {
      const storedFavorites = this.getStoredFavorites(userId);
      const mockedFavorites = favoriteData
        .filter(fav => fav.userId === userId)
        .map(fav => Number(fav.recipeId));

      this.updateState({
        favoriteIds: new Set([...storedFavorites, ...mockedFavorites]),
        loading: false
      });
    } catch (error) {
      console.error('Error loading user favorites:', error);
      this.notificationService.showNotification('Error loading favorites', 'error');
      this.updateState({ loading: false });
    }
  }

  get favoriteIds$(): Observable<Set<number>> {
    return this.state$.pipe(map(state => state.favoriteIds));
  }

  get loadingRecipeId$(): Observable<number | null> {
    return this.state$.pipe(map(state => state.loadingRecipeId));
  }

  get currentState(): FavoritesState {
    return this.favoritesSubject.getValue();
  }

  isFavorite(recipeId: number): boolean {
    return this.currentState.favoriteIds.has(recipeId);
  }

  toggleFavorite(recipeId: number): Observable<boolean> {
    this.updateState({ loadingRecipeId: recipeId });
    const isFavorite = this.isFavorite(recipeId);
    const recipeName = this.getRecipeTitle(recipeId);

    return this.useBackend
      ? this.toggleFavoriteApi(recipeId, isFavorite, recipeName)
      : this.toggleFavoriteLocal(recipeId, isFavorite, recipeName);
  }

  private toggleFavoriteApi(recipeId: number, isFavorite: boolean, recipeName: string): Observable<boolean> {
    if (isFavorite) {
      return this.favoriteApiService.removeFavorite(recipeId).pipe(
        map(() => {
          this.removeFavoriteFromState(recipeId);
          this.notificationService.showNotification(`${recipeName} removed from favorites`, 'info');
          return false;
        }),
        catchError(error => {
          console.error('Error removing favorite:', error);
          this.updateState({ loadingRecipeId: null });
          this.notificationService.showNotification('Failed to remove from favorites', 'error');
          return of(true);
        })
      );
    }

    return this.favoriteApiService.addFavorite(recipeId).pipe(
      map(() => {
        this.addFavoriteToState(recipeId);
        this.notificationService.showNotification(`${recipeName} added to favorites!`, 'success');
        return true;
      }),
      catchError(error => {
        console.error('Error adding favorite:', error);
        this.updateState({ loadingRecipeId: null });
        this.notificationService.showNotification('Failed to add to favorites', 'error');
        return of(false);
      })
    );
  }

  private toggleFavoriteLocal(recipeId: number, isFavorite: boolean, recipeName: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      setTimeout(() => {
        if (isFavorite) {
          this.removeFavoriteFromState(recipeId);
          this.notificationService.showNotification(`${recipeName} removed from favorites`, 'info');
        } else {
          this.addFavoriteToState(recipeId);
          this.notificationService.showNotification(`${recipeName} added to favorites!`, 'success');
        }

        this.saveFavoritesToStorage();
        observer.next(!isFavorite);
        observer.complete();
      }, 300);
    });
  }

  private addFavoriteToState(recipeId: number): void {
    const newFavorites = new Set<number>(this.currentState.favoriteIds);
    newFavorites.add(recipeId);
    this.updateState({
      favoriteIds: newFavorites,
      loadingRecipeId: null
    });
  }

  private removeFavoriteFromState(recipeId: number): void {
    const newFavorites = new Set<number>(this.currentState.favoriteIds);
    newFavorites.delete(recipeId);
    this.updateState({
      favoriteIds: newFavorites,
      loadingRecipeId: null
    });
  }

  getFavoriteRecipes(query = '', page = 1, pageSize = 10): Observable<FavoriteSearchResponse> {
    this.updateState({ loading: true });

    return this.useBackend
      ? this.getFavoriteRecipesFromApi(query, page, pageSize)
      : this.getFavoriteRecipesFromLocal(query, page, pageSize);
  }

  private getFavoriteRecipesFromApi(query: string, page: number, pageSize: number): Observable<FavoriteSearchResponse> {
    return this.favoriteApiService.getFavorites().pipe(
      switchMap(response => {
        const favoriteIds = response.map(fav => Number(fav.recipeId));

        if (favoriteIds.length === 0) {
          this.updateState({ loading: false });
          return of({ results: [], total: 0, totalPages: 0, page: 1 });
        }

        return this.fetchRecipeDetails(favoriteIds, query, page, pageSize);
      }),
      catchError(error => {
        console.error('Error fetching favorite recipes:', error);
        this.updateState({ loading: false });
        this.notificationService.showNotification('Error loading favorite recipes', 'error');
        return of({ results: [], total: 0, totalPages: 0, page: 1 });
      })
    );
  }

  private getFavoriteRecipesFromLocal(query: string, page: number, pageSize: number): Observable<FavoriteSearchResponse> {
    return new Observable<FavoriteSearchResponse>(observer => {
      setTimeout(() => {
        const favoriteIds = Array.from(this.currentState.favoriteIds);
        let filteredRecipes = recipes.filter(recipe => favoriteIds.includes(recipe.id));

        if (query) {
          const lowerQuery = query.toLowerCase();
          filteredRecipes = filteredRecipes.filter(recipe =>
            recipe.title.toLowerCase().includes(lowerQuery)
          );
        }

        const paginatedResults = this.paginateResults(filteredRecipes, page, pageSize);
        this.updateState({ loading: false });
        observer.next(paginatedResults);
        observer.complete();
      }, 600);
    });
  }

  private fetchRecipeDetails(favoriteIds: number[], query: string, page: number, pageSize: number): Observable<FavoriteSearchResponse> {
    if (query) {
      return forkJoin(
        favoriteIds.map(id => this.recipeDetailApiService.getRecipeById(id).pipe(
          catchError(() => of(null))
        ))
      ).pipe(
        map(recipeDetails => {
          const filteredRecipes = recipeDetails
            .filter(detail => detail !== null)
            .filter(detail => detail.title.toLowerCase().includes(query.toLowerCase()))
            .map(detail => this.convertDetailToRecipe(detail));

          const paginatedResults = this.paginateResults(filteredRecipes, page, pageSize);
          this.updateState({ loading: false });
          return paginatedResults;
        })
      );
    }

    const total = favoriteIds.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    const paginatedIds = favoriteIds.slice(start, end);

    return forkJoin(
      paginatedIds.map(id => this.recipeDetailApiService.getRecipeById(id).pipe(
        catchError(() => of(null))
      ))
    ).pipe(
      map(recipeDetails => {
        const paginatedRecipes = recipeDetails
          .filter(detail => detail !== null)
          .map(detail => this.convertDetailToRecipe(detail));

        this.updateState({ loading: false });

        return {
          results: paginatedRecipes,
          total,
          totalPages,
          page
        };
      })
    );
  }

  private paginateResults(recipes: RecipeType[], page: number, pageSize: number): FavoriteSearchResponse {
    const total = recipes.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);

    return {
      results: recipes.slice(start, end),
      total,
      totalPages,
      page
    };
  }

  private getRecipeTitle(id: number): string {
    const recipe = recipes.find(r => r.id === id);
    return recipe ? recipe.title : 'Recipe';
  }

  private convertDetailToRecipe(detail: RecipeDetailType): RecipeType {
    return {
      _id: detail._id,
      id: detail.externalId,
      title: detail.title,
      image: detail.image,
      readyInMinutes: detail.readyInMinutes,
      healthScore: detail.healthScore,
      cuisines: detail.cuisines,
      dishTypes: detail.dishTypes,
      diets: detail.diets
    };
  }

  private getStoredFavorites(userId: string): number[] {
    const key = this.getFavoriteStorageKey(userId);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  private saveFavoritesToStorage(): void {
    if (this.useBackend) return;

    try {
      const user = this.authStore?.currentState?.user;
      if (!user) return;

      const key = this.getFavoriteStorageKey(user.id);
      const favoriteIdsArray = Array.from(this.currentState.favoriteIds);
      localStorage.setItem(key, JSON.stringify(favoriteIdsArray));
    } catch (error) {
      console.error('Error saving favorites to storage:', error);
      this.notificationService.showNotification('Error saving favorites', 'error');
    }
  }

  private getFavoriteStorageKey(userId: string): string {
    return `${this.BASE_STORAGE_KEY}${userId}`;
  }

  private clearFavorites(): void {
    this.updateState({ favoriteIds: new Set<number>() });
  }

  private updateState(partialState: Partial<FavoritesState>): void {
    this.favoritesSubject.next({
      ...this.currentState,
      ...partialState
    });
  }
}
