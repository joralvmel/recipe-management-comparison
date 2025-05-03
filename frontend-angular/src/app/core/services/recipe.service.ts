import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { RecipeType } from '@models/recipe.model';
import { recipes } from '@app/data/mock-recipes';

export interface SearchFilters {
  query: string;
  mealType: string;
  cuisine: string;
  diet: string;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private favoriteIds: Set<number> = new Set(this.getStoredFavorites());
  private favoritesSubject = new BehaviorSubject<Set<number>>(this.favoriteIds);


  searchRecipes(filters: SearchFilters): Observable<{
    results: RecipeType[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
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

    return of({
      results: paginatedResults,
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages
    });
  }

  toggleFavorite(recipeId: number): void {
    if (this.favoriteIds.has(recipeId)) {
      this.favoriteIds.delete(recipeId);
    } else {
      this.favoriteIds.add(recipeId);
    }

    localStorage.setItem('favorites', JSON.stringify([...this.favoriteIds]));
    this.favoritesSubject.next(new Set(this.favoriteIds));
  }

  isFavorite(recipeId: number): boolean {
    return this.favoriteIds.has(recipeId);
  }

  getFavorites(): Observable<Set<number>> {
    return this.favoritesSubject.asObservable();
  }

  private getStoredFavorites(): number[] {
    const stored = localStorage.getItem('favorites');
    return stored ? JSON.parse(stored) : [];
  }
}
