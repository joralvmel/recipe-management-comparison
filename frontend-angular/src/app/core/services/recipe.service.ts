import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { RecipeType } from '@models/recipe.model';
import { recipes } from '@app/data/mock-recipes';
import { RecipeApiService } from '@core/http/recipe-api.service';
import { CacheService } from '@core/services/cache.service';

export interface SearchFilters {
  query: string;
  mealType: string;
  cuisine: string;
  diet: string;
  page: number;
  pageSize: number;
}

export interface SearchResult {
  results: RecipeType[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private favoriteIds: Set<number> = new Set(this.getStoredFavorites());
  private useBackend = process.env.USE_BACKEND === 'true';
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private SEARCH_STALE_TIME = 5 * 60 * 1000;

  constructor(
    private recipeApiService: RecipeApiService,
    private cacheService: CacheService
  ) {}

  get isLoading$(): Observable<boolean> {
    return this.isLoadingSubject.asObservable();
  }

  searchRecipes(filters: SearchFilters): Observable<SearchResult> {
    const cacheKey = this.generateCacheKey(filters);

    this.isLoadingSubject.next(true);

    const { data: result$, isLoading$ } = this.cacheService.get<SearchResult>(
      cacheKey,
      () => this.fetchRecipes(filters),
      this.SEARCH_STALE_TIME
    );

    isLoading$.subscribe(isLoading => {
      this.isLoadingSubject.next(isLoading);
    });

    return result$;
  }

  private generateCacheKey(filters: SearchFilters): string {
    return `recipes-${filters.query}-${filters.mealType}-${filters.cuisine}-${filters.diet}-${filters.page}-${filters.pageSize}`;
  }

  private fetchRecipes(filters: SearchFilters): Observable<SearchResult> {
    if (this.useBackend) {
      return this.searchRecipesFromApi(filters);
    }
    return this.searchRecipesFromMock(filters);
  }

  private searchRecipesFromApi(filters: SearchFilters): Observable<SearchResult> {
    const offset = (filters.page - 1) * filters.pageSize;

    return this.recipeApiService.searchRecipes(
      filters.query,
      filters.cuisine,
      filters.diet,
      filters.mealType,
      offset,
      filters.pageSize
    ).pipe(
      map(response => {
        return {
          results: response.results,
          total: response.totalResults,
          page: filters.page,
          pageSize: filters.pageSize,
          totalPages: Math.ceil(response.totalResults / filters.pageSize)
        };
      }),
      catchError(error => {
        console.error('Error searching recipes:', error);
        return of({
          results: [],
          total: 0,
          page: filters.page,
          pageSize: filters.pageSize,
          totalPages: 0
        });
      }),
      finalize(() => {
        this.isLoadingSubject.next(false);
      })
    );
  }

  private searchRecipesFromMock(filters: SearchFilters): Observable<SearchResult> {
    let filtered = [...recipes];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(query));
    }

    if (filters.mealType) {
      filtered = filtered.filter(recipe =>
        recipe.dishTypes.some(type =>
          type.toLowerCase().includes(filters.mealType.toLowerCase())));
    }

    if (filters.cuisine) {
      filtered = filtered.filter(recipe =>
        recipe.cuisines.some(cuisine =>
          cuisine.toLowerCase() === filters.cuisine.toLowerCase()));
    }

    if (filters.diet) {
      filtered = filtered.filter(recipe =>
        recipe.diets.some(diet =>
          diet.toLowerCase().includes(filters.diet.toLowerCase())));
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / filters.pageSize);
    const startIndex = (filters.page - 1) * filters.pageSize;
    const paginatedResults = filtered.slice(
      startIndex,
      startIndex + filters.pageSize
    );

    return new Observable<SearchResult>(observer => {
      setTimeout(() => {
        observer.next({
          results: paginatedResults,
          total,
          page: filters.page,
          pageSize: filters.pageSize,
          totalPages
        });
        observer.complete();
      }, 300);
    });
  }

  private getStoredFavorites(): number[] {
    const stored = localStorage.getItem('favorites');
    return stored ? JSON.parse(stored) : [];
  }
}
