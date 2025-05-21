import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface AuthResponse {
  token: string;
}

interface RegisterResponse {
  id: string;
  name: string;
  email: string;
}

interface UsernameResponse {
  username: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private apiUrl = process.env.API_URL;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, {
      email,
      password,
    });
  }

  register(
    name: string,
    email: string,
    password: string,
  ): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, {
      name,
      email,
      password,
    });
  }

  getUsernameById(userId: string): Observable<UsernameResponse> {
    return this.http.get<UsernameResponse>(
      `${this.apiUrl}/auth/username/${userId}`,
    );
  }
}
