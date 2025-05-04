import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecipeDetailType } from '@models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeDetailApiService {
  private apiUrl = process.env.API_URL;

  constructor(private http: HttpClient) {}
  getRecipeById(id: number): Observable<RecipeDetailType> {
    return this.http.get<RecipeDetailType>(`${this.apiUrl}/recipes/${id}`);
  }
}
