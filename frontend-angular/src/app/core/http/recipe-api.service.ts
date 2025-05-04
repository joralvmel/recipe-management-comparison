import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecipeType } from '@models/recipe.model';

export interface RecipeSearchResponse {
  results: RecipeType[];
  offset: number;
  number: number;
  totalResults: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeApiService {
  private apiUrl = process.env.API_URL;

  constructor(private http: HttpClient) {}

  searchRecipes(
    query?: string,
    cuisine?: string,
    diet?: string,
    mealType?: string,
    offset = 0,
    number = 10
  ): Observable<RecipeSearchResponse> {
    let params = new HttpParams();

    if (query) params = params.append('query', query);
    if (cuisine) params = params.append('cuisine', cuisine);
    if (diet) params = params.append('diet', diet);
    if (mealType) params = params.append('mealType', mealType);

    params = params.append('offset', offset.toString());
    params = params.append('number', number.toString());

    return this.http.get<RecipeSearchResponse>(`${this.apiUrl}/recipes/search`, { params });
  }
}
