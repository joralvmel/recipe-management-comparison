import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { RecipeType } from '@models/recipe.model';
import { recipes } from '@app/data/mock-recipes';
import { RecipeApiService } from '@core/http/recipe-api.service';
import { CacheService } from '@shared/services/cache.service';

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
  private useBackend = process.env.USE_BACKEND === 'true';
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private readonly SEARCH_STALE_TIME = 5 * 60 * 1000;

  readonly isLoading$ = this.isLoadingSubject.asObservable();

  constructor(
    private recipeApiService: RecipeApiService,
    private cacheService: CacheService
  ) {}

  searchRecipes(filters: SearchFilters): Observable<SearchResult> {
    const cacheKey = this.generateCacheKey(filters);
    this.isLoadingSubject.next(true);

    const { data: result$, isLoading$ } = this.cacheService.get<SearchResult>(
      cacheKey,
      () => this.useBackend
        ? this.searchRecipesFromApi(filters)
        : this.searchRecipesFromMock(filters),
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
      map(response => ({
        results: response.results,
        total: response.totalResults,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(response.totalResults / filters.pageSize)
      })),
      catchError(error => {
        console.error('Error searching recipes:', error);
        return of(this.createEmptyResult(filters));
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  private searchRecipesFromMock(filters: SearchFilters): Observable<SearchResult> {
    return new Observable<SearchResult>(observer => {
      setTimeout(() => {
        const filtered = this.applyFilters(recipes, filters);
        const result = this.applyPagination(filtered, filters);

        observer.next(result);
        observer.complete();
        this.isLoadingSubject.next(false);
      }, 300);
    });
  }

  private applyFilters(recipesList: RecipeType[], filters: SearchFilters): RecipeType[] {
    let filtered = [...recipesList];

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

    return filtered;
  }

  private applyPagination(filtered: RecipeType[], filters: SearchFilters): SearchResult {
    const total = filtered.length;
    const totalPages = Math.ceil(total / filters.pageSize);
    const startIndex = (filters.page - 1) * filters.pageSize;
    const paginatedResults = filtered.slice(
      startIndex,
      startIndex + filters.pageSize
    );

    return {
      results: paginatedResults,
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages
    };
  }

  private createEmptyResult(filters: SearchFilters): SearchResult {
    return {
      results: [],
      total: 0,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: 0
    };
  }
}
