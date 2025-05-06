import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  decodeToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      this.removeToken();
      return null;
    }
  }

  isTokenValid(): boolean {
    const decoded = this.decodeToken();
    if (!decoded) return false;

    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  }

  getUserFromToken(): { id: string; name: string; email: string } | null {
    const decoded = this.decodeToken();
    if (!decoded) return null;

    return {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
    };
  }
}
