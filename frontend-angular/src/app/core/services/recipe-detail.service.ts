import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RecipeDetailType } from '@models/recipe.model';
import { recipeData } from '@app/data/mock-recipe-details';

@Injectable({
  providedIn: 'root'
})
export class RecipeDetailService {
  getRecipeById(id: number): Observable<RecipeDetailType | undefined> {
    const recipe = recipeData.find(r => r.externalId === id);
    return of(recipe);
  }

  getScaledAmount(amount: number, originalServings: number, newServings: number): number {
    return (amount / originalServings) * newServings;
  }

  calculateRecipeMetrics(recipeId: number): Observable<{ calories: number, protein: number, fat: number }> {
    return of({ calories: 350, protein: 12, fat: 15 });
  }
}
