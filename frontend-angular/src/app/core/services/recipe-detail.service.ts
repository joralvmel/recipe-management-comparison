import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RecipeDetailType } from '@models/recipe.model';
import { recipeData } from '@app/data/mock-recipe-details';
import { RecipeDetailApiService } from '@core/http/recipe-detail-api.service';

@Injectable({
  providedIn: 'root'
})
export class RecipeDetailService {
  private useBackend = process.env.USE_BACKEND === 'true';

  constructor(private recipeDetailApiService: RecipeDetailApiService) {}

  getRecipeById(id: number): Observable<RecipeDetailType | undefined> {
    if (this.useBackend) {
      return this.getRecipeByIdFromApi(id);
    }
    return this.getRecipeByIdFromMock(id);
  }

  private getRecipeByIdFromApi(id: number): Observable<RecipeDetailType | undefined> {
    return this.recipeDetailApiService.getRecipeById(id).pipe(
      catchError(error => {
        console.error('Error fetching recipe details:', error);
        return of(undefined);
      })
    );
  }

  private getRecipeByIdFromMock(id: number): Observable<RecipeDetailType | undefined> {
    const recipe = recipeData.find(r => r.externalId === id);
    return of(recipe);
  }

  getScaledAmount(amount: number, originalServings: number, newServings: number): number {
    return (amount / originalServings) * newServings;
  }
}
