import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FavoriteSearchResponse, FavoritesStoreService } from '@core/store/favorites-store.service';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  constructor(private favoritesStore: FavoritesStoreService) {}

  getFavorites(): Observable<Set<number>> {
    return this.favoritesStore.favoriteIds$;
  }

  getLoadingFavoriteId(): Observable<number | null> {
    return this.favoritesStore.loadingRecipeId$;
  }

  isFavorite(recipeId: number): boolean {
    return this.favoritesStore.isFavorite(recipeId);
  }

  toggleFavorite(recipeId: number): Observable<boolean> {
    return this.favoritesStore.toggleFavorite(recipeId);
  }

  getFavoriteRecipes(
    query = '',
    page = 1,
    pageSize = 10
  ): Observable<FavoriteSearchResponse> {
    return this.favoritesStore.getFavoriteRecipes(query, page, pageSize);
  }
}
