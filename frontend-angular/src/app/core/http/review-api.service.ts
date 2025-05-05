import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReviewType } from '@models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewApiService {
  private apiUrl = process.env.API_URL;

  constructor(private http: HttpClient) {}

  getReviewsByRecipeId(recipeId: string): Observable<ReviewType[]> {
    return this.http.get<ReviewType[]>(`${this.apiUrl}/reviews/${recipeId}`);
  }

  addReview(recipeId: string, rating: number, content: string): Observable<ReviewType> {
    return this.http.post<ReviewType>(`${this.apiUrl}/reviews/${recipeId}`, {
      rating,
      content
    });
  }

  updateReview(reviewId: string, rating: number, content: string): Observable<ReviewType> {
    return this.http.put<ReviewType>(`${this.apiUrl}/reviews/${reviewId}`, {
      rating,
      content
    });
  }

  deleteReview(reviewId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reviews/${reviewId}`);
  }
}
