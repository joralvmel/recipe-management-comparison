import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { RecipeType } from '@models/recipe.model';
import { favoriteData } from '@app/data/mock-favorites';
import { recipes } from '@app/data/mock-recipes';
import { AuthService } from '@core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService implements OnDestroy {
  private favoriteIds: Set<number> = new Set();
  private favoritesSubject = new BehaviorSubject<Set<number>>(this.favoriteIds);
  private authSubscription: Subscription;

  constructor(private authService: AuthService) {
    this.loadUserFavorites();

    this.authSubscription = this.authService.getUserObservable().subscribe(user => {
      this.loadUserFavorites();
    });
  }

  private loadUserFavorites(): void {
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      this.favoriteIds = new Set();
      this.favoritesSubject.next(this.favoriteIds);
      return;
    }

    const storedFavorites = this.getStoredFavorites(currentUser.id);

    const mockedFavorites = favoriteData
      .filter(fav => fav.userId === currentUser.id)
      .map(fav => Number(fav.recipeId));

    this.favoriteIds = new Set([...storedFavorites, ...mockedFavorites]);
    this.favoritesSubject.next(this.favoriteIds);
  }

  getFavoriteRecipes(query = '', page = 1, pageSize = 10): Observable<{
    results: RecipeType[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    if (!this.authService.currentUser) {
      return of({
        results: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0
      });
    }

    const currentFavorites = [...this.favoritesSubject.value];

    let favoriteRecipes = recipes.filter(recipe =>
      currentFavorites.includes(recipe.id)
    );

    if (query) {
      const queryLower = query.toLowerCase();
      favoriteRecipes = favoriteRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(queryLower)
      );
    }

    const total = favoriteRecipes.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIndex = (page - 1) * pageSize;
    const paginatedResults = favoriteRecipes.slice(startIndex, startIndex + pageSize);

    return of({
      results: paginatedResults,
      total,
      page,
      pageSize,
      totalPages
    });
  }

  toggleFavorite(recipeId: number): Observable<boolean> {
    if (!this.authService.currentUser) {
      return of(false);
    }

    if (this.favoriteIds.has(recipeId)) {
      this.favoriteIds.delete(recipeId);
    } else {
      this.favoriteIds.add(recipeId);
    }

    this.saveToLocalStorage();

    this.favoritesSubject.next(new Set(this.favoriteIds));

    return of(this.favoriteIds.has(recipeId));
  }

  isFavorite(recipeId: number): boolean {
    return this.favoriteIds.has(recipeId);
  }

  getFavorites(): Observable<Set<number>> {
    return this.favoritesSubject.asObservable();
  }

  private getStoredFavorites(userId: string): number[] {
    const key = this.getFavoriteStorageKey(userId);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  private saveToLocalStorage(): void {
    if (!this.authService.currentUser) return;

    const key = this.getFavoriteStorageKey(this.authService.currentUser.id);
    localStorage.setItem(key, JSON.stringify([...this.favoriteIds]));
  }

  private getFavoriteStorageKey(userId: string): string {
    return `favorites_${userId}`;
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
