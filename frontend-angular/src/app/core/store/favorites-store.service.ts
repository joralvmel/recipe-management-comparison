import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RecipeType } from '@models/recipe.model';
import { recipes } from '@app/data/mock-recipes';
import { favoriteData } from '@app/data/mock-favorites';
import { AuthStoreService } from '@core/store/auth-store.service';

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

  constructor(private authStore: AuthStoreService) {
    this.initializeState();

    this.authStore.user$.subscribe(user => {
      if (user) {
        this.loadUserFavorites(user.id);
      } else {
        this.clearFavorites();
      }
    });
  }

  private initializeState(): void {
    try {
      const user = this.authStore?.currentState?.user;
      if (user) {
        this.loadUserFavorites(user.id);
      }
    } catch (error) {
      console.error('Error initializing favorites store:', error);
    }
  }

  private loadUserFavorites(userId: string): void {
    try {
      const storedFavorites = this.getStoredFavorites(userId);
      const mockedFavorites = favoriteData
        .filter(fav => fav.userId === userId)
        .map(fav => Number(fav.recipeId));

      this.updateState({
        favoriteIds: new Set([...storedFavorites, ...mockedFavorites])
      });
    } catch (error) {
      console.error('Error loading user favorites:', error);
    }
  }

  get favoriteIds$(): Observable<Set<number>> {
    return this.state$.pipe(
      map(state => state.favoriteIds)
    );
  }

  get loading$(): Observable<boolean> {
    return this.state$.pipe(
      map(state => state.loading)
    );
  }

  get currentState(): FavoritesState {
    return this.favoritesSubject.getValue();
  }

  get favoriteIds(): Set<number> {
    return this.currentState.favoriteIds;
  }

  isFavorite(recipeId: number): boolean {
    return this.currentState.favoriteIds.has(recipeId);
  }

  toggleFavorite(recipeId: number): Observable<boolean> {
    this.updateState({
      loadingRecipeId: recipeId
    });

    const isFavorite = this.isFavorite(recipeId);
    const newFavorites = new Set<number>(this.currentState.favoriteIds);

    if (isFavorite) {
      newFavorites.delete(recipeId);
    } else {
      newFavorites.add(recipeId);
    }

    return new Observable<boolean>(observer => {
      setTimeout(() => {
        this.updateState({
          favoriteIds: newFavorites,
          loadingRecipeId: null
        });
        this.saveFavoritesToStorage();
        observer.next(!isFavorite);
        observer.complete();
      }, 300);
    });
  }

  getFavoriteRecipes(
    query = '',
    page = 1,
    pageSize = 10
  ): Observable<FavoriteSearchResponse> {
    this.updateState({ loading: true });

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

        const total = filteredRecipes.length;
        const totalPages = Math.ceil(total / pageSize);
        const start = (page - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        const paginatedRecipes = filteredRecipes.slice(start, end);

        observer.next({
          results: paginatedRecipes,
          total,
          totalPages,
          page
        });

        this.updateState({ loading: false });
        observer.complete();
      }, 600);
    });
  }

  private getStoredFavorites(userId: string): number[] {
    const key = this.getFavoriteStorageKey(userId);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  private saveFavoritesToStorage(): void {
    try {
      const user = this.authStore?.currentState?.user;
      if (!user) return;

      const key = this.getFavoriteStorageKey(user.id);
      const favoriteIdsArray = Array.from(this.currentState.favoriteIds);
      localStorage.setItem(key, JSON.stringify(favoriteIdsArray));
    } catch (error) {
      console.error('Error saving favorites to storage:', error);
    }
  }

  private getFavoriteStorageKey(userId: string): string {
    return `${this.BASE_STORAGE_KEY}${userId}`;
  }

  private clearFavorites(): void {
    this.updateState({
      favoriteIds: new Set<number>()
    });
  }

  private updateState(partialState: Partial<FavoritesState>): void {
    this.favoritesSubject.next({
      ...this.currentState,
      ...partialState
    });
  }
}
