import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { RecipeDetailType } from '@models/recipe.model';
import { recipeData } from '@app/data/mock-recipe-details';
import { RecipeDetailApiService } from '@core/http/recipe-detail-api.service';
import { CacheService } from '@shared/services/cache.service';

@Injectable({
  providedIn: 'root'
})
export class RecipeDetailService {
  private readonly useBackend = process.env.USE_BACKEND === 'true';
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private readonly RECIPE_CACHE_TIME = 15 * 60 * 1000;

  readonly isLoading$ = this.isLoadingSubject.asObservable();

  constructor(
    private recipeDetailApiService: RecipeDetailApiService,
    private cacheService: CacheService
  ) {}

  getRecipeById(id: number): Observable<RecipeDetailType | undefined> {
    const cacheKey = `recipe-detail-${id}`;
    this.isLoadingSubject.next(true);

    const { data: result$ } = this.cacheService.get<RecipeDetailType | undefined>(
      cacheKey,
      () => this.fetchRecipeDetails(id),
      this.RECIPE_CACHE_TIME
    );

    return result$.pipe(
      tap(recipe => {
        if (!recipe) {
          console.warn(`Recipe with ID ${id} not found`);
        }
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  private fetchRecipeDetails(id: number): Observable<RecipeDetailType | undefined> {
    return this.useBackend
      ? this.getRecipeByIdFromApi(id)
      : this.getRecipeByIdFromMock(id);
  }

  private getRecipeByIdFromApi(id: number): Observable<RecipeDetailType | undefined> {
    return this.recipeDetailApiService.getRecipeById(id).pipe(
      catchError(error => {
        console.error(`Error fetching recipe details for ID ${id}:`, error);
        return of(undefined);
      })
    );
  }

  private getRecipeByIdFromMock(id: number): Observable<RecipeDetailType | undefined> {
    return new Observable<RecipeDetailType | undefined>(observer => {
      setTimeout(() => {
        const recipe = recipeData.find(r => r.externalId === id);
        observer.next(recipe);
        observer.complete();
      }, 200);
    });
  }
}
