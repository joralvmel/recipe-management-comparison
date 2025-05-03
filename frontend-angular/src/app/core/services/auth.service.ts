import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { UserType } from '@models/user.model';
import { AuthStoreService } from '@core/store/auth-store.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private authStore: AuthStoreService) {
    this.authStore.loadUserFromStorage();
  }

  get currentUser(): UserType | null {
    return this.authStore.currentUser;
  }

  get isAuthenticated(): boolean {
    return this.authStore.isAuthenticated;
  }

  getUserObservable(): Observable<UserType | null> {
    return this.authStore.user$;
  }

  getUserById(userId: string): Observable<UserType | null> {
    return this.authStore.getUserById(userId);
  }

  login(email: string, password: string): boolean {
    this.authStore.login(email, password);
    return true;
  }

  register(name: string, email: string, password: string): boolean {
    this.authStore.register(name, email, password);
    return true;
  }

  logout(): void {
    this.authStore.logout();
  }
}
