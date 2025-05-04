import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { map, catchError, finalize, tap, switchMap } from 'rxjs/operators';
import { RecipeType, RecipeDetailType } from '@models/recipe.model';
import { recipes } from '@app/data/mock-recipes';
import { favoriteData } from '@app/data/mock-favorites';
import { AuthStoreService } from '@core/store/auth-store.service';
import { FavoriteApiService } from '@core/http/favorite-api.service';
import { RecipeDetailApiService } from '@core/http/recipe-detail-api.service';

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
    private recipeDetailApiService: RecipeDetailApiService
  ) {
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
    this.updateState({ loading: true });

    if (this.useBackend) {
      this.favoriteApiService.getFavorites().pipe(
        catchError(error => {
          console.error('Error loading favorites from API:', error);
          return of([]);
        }),
        finalize(() => this.updateState({ loading: false }))
      ).subscribe(response => {
        const favoriteIds = new Set<number>(
          response.map(fav => Number(fav.recipeId))
        );
        this.updateState({ favoriteIds });
      });
    } else {
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
        this.updateState({ loading: false });
      }
    }
  }

  get favoriteIds$(): Observable<Set<number>> {
    return this.state$.pipe(
      map(state => state.favoriteIds)
    );
  }

  get loadingRecipeId$(): Observable<number | null> {
    return this.state$.pipe(
      map(state => state.loadingRecipeId)
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

    if (this.useBackend) {
      if (isFavorite) {
        return this.favoriteApiService.removeFavorite(recipeId).pipe(
          map(() => {
            const newFavorites = new Set<number>(this.currentState.favoriteIds);
            newFavorites.delete(recipeId);
            this.updateState({
              favoriteIds: newFavorites,
              loadingRecipeId: null
            });
            return false;
          }),
          catchError(error => {
            console.error('Error removing favorite:', error);
            this.updateState({ loadingRecipeId: null });
            return of(true);
          })
        );
      }

      return this.favoriteApiService.addFavorite(recipeId).pipe(
        map(() => {
          const newFavorites = new Set<number>(this.currentState.favoriteIds);
          newFavorites.add(recipeId);
          this.updateState({
            favoriteIds: newFavorites,
            loadingRecipeId: null
          });
          return true;
        }),
        catchError(error => {
          console.error('Error adding favorite:', error);
          this.updateState({ loadingRecipeId: null });
          return of(false);
        })
      );
    }

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

  private convertDetailToRecipe(detail: RecipeDetailType): RecipeType {
    return {
      _id: detail._id,
      id: detail.externalId, // Usar externalId como id
      title: detail.title,
      image: detail.image,
      readyInMinutes: detail.readyInMinutes,
      healthScore: detail.healthScore,
      cuisines: detail.cuisines,
      dishTypes: detail.dishTypes,
      diets: detail.diets
    };
  }

  getFavoriteRecipes(
    query = '',
    page = 1,
    pageSize = 10
  ): Observable<FavoriteSearchResponse> {
    this.updateState({ loading: true });

    if (this.useBackend) {
      return this.favoriteApiService.getFavorites().pipe(
        switchMap(response => {
          const favoriteIds = response.map(fav => Number(fav.recipeId));

          if (favoriteIds.length === 0) {
            this.updateState({ loading: false });
            return of({
              results: [],
              total: 0,
              totalPages: 0,
              page: 1
            });
          }

          if (query) {
            return forkJoin(
              favoriteIds.map(id =>
                this.recipeDetailApiService.getRecipeById(id).pipe(
                  catchError(() => of(null))
                )
              )
            ).pipe(
              map(recipeDetails => {
                const filteredRecipes = recipeDetails
                  .filter(detail => detail !== null)
                  .filter(detail =>
                    !query || detail.title.toLowerCase().includes(query.toLowerCase())
                  )
                  .map(detail => this.convertDetailToRecipe(detail));

                const total = filteredRecipes.length;
                const totalPages = Math.ceil(total / pageSize);
                const start = (page - 1) * pageSize;
                const end = Math.min(start + pageSize, total);
                const paginatedRecipes = filteredRecipes.slice(start, end);

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

          const total = favoriteIds.length;
          const totalPages = Math.ceil(total / pageSize);
          const start = (page - 1) * pageSize;
          const end = Math.min(start + pageSize, total);
          const paginatedIds = favoriteIds.slice(start, end);

          return forkJoin(
            paginatedIds.map(id =>
              this.recipeDetailApiService.getRecipeById(id).pipe(
                catchError(() => of(null))
              )
            )
          ).pipe(
            map(recipeDetails => {
              const paginatedRecipes = recipeDetails
                .filter(detail => detail !== null)
                .map(detail => this.convertDetailToRecipe(detail)); // Convertir a RecipeType

              this.updateState({ loading: false });

              return {
                results: paginatedRecipes,
                total,
                totalPages,
                page
              };
            })
          );
        }),
        catchError(error => {
          console.error('Error fetching favorite recipes:', error);
          this.updateState({ loading: false });
          return of({
            results: [],
            total: 0,
            totalPages: 0,
            page: 1
          });
        })
      );
    }

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
      if (this.useBackend) return;

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
