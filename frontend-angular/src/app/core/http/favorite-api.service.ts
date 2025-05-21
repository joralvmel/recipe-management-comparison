import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecipeType } from '@models/recipe.model';

interface FavoriteResponse {
  recipeId: string;
}

export interface FavoriteItem {
  _id: string;
  userId: string;
  recipeId: string;
  createdAt: string;
}

export type FavoritesListResponse = FavoriteItem[];

@Injectable({
  providedIn: 'root'
})
export class FavoriteApiService {
  private apiUrl = process.env.API_URL;

  constructor(private http: HttpClient) {}

  getFavorites(): Observable<FavoritesListResponse> {
    return this.http.get<FavoritesListResponse>(`${this.apiUrl}/favorites`);
  }

  addFavorite(recipeId: number): Observable<FavoriteResponse> {
    return this.http.post<FavoriteResponse>(`${this.apiUrl}/favorites`, {
      recipeId: recipeId.toString()
    });
  }

  removeFavorite(recipeId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/favorites/${recipeId}`);
  }
}
