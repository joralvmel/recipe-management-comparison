import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, distinctUntilChanged } from 'rxjs/operators';
import { UserType } from '@models/user.model';
import { userData } from '@app/data/mock-users';
import { AuthApiService } from '@core/http/auth-api.service';
import { TokenService } from '@shared/services/token.service';
import { NotificationService } from '@shared/services/notification.service';

export interface AuthState {
  user: UserType | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class AuthStoreService {
  private readonly STORAGE_KEY = 'gastronest_user';
  private authSubject = new BehaviorSubject<AuthState>(this.getInitialState());
  private state$ = this.authSubject.asObservable();
  private useBackend = process.env.USE_BACKEND === 'true';

  readonly user$ = this.state$.pipe(map(state => state.user), distinctUntilChanged());
  readonly isAuthenticated$ = this.state$.pipe(map(state => !!state.user), distinctUntilChanged());
  readonly loading$ = this.state$.pipe(map(state => state.loading), distinctUntilChanged());
  readonly error$ = this.state$.pipe(map(state => state.error), distinctUntilChanged());

  constructor(
    private router: Router,
    private authApiService: AuthApiService,
    private tokenService: TokenService,
    private notificationService: NotificationService,
  ) {
    this.loadUserFromStorage();
  }

  get currentState(): AuthState {
    return this.authSubject.getValue();
  }

  get currentUser(): UserType | null {
    return this.currentState.user;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  login(email: string, password: string): void {
    this.updateState({ loading: true, error: null });

    this.useBackend
      ? this.loginWithBackend(email, password)
      : this.loginWithMockData(email, password);
  }

  register(name: string, email: string, password: string): void {
    this.updateState({ loading: true, error: null });

    this.useBackend
      ? this.registerWithBackend(name, email, password)
      : this.registerWithMockData(name, email, password);
  }

  logout(): void {
    this.tokenService.removeToken();
    localStorage.removeItem(this.STORAGE_KEY);
    this.authSubject.next(initialState);
    this.notificationService.showNotification('Logged out successfully!', 'info');
    this.router.navigate(['/']);
  }

  loadUserFromStorage(): void {
    if (this.useBackend) {
      if (this.tokenService.isTokenValid()) {
        const userData = this.tokenService.getUserFromToken();
        if (userData) {
          this.updateState({
            user: {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              createdAt: Date.now(),
            }
          });
        } else {
          this.logout();
        }
      }
    } else {
      const user = this.getStoredUser();
      if (user) {
        this.updateState({ user });
      }
    }
  }

  getUserById(userId: string): Observable<UserType | null> {
    if (this.currentUser && this.currentUser.id === userId) {
      return of(this.currentUser);
    }

    return this.useBackend
      ? this.getUserByIdFromBackend(userId)
      : this.getUserByIdFromMockData(userId);
  }

  private loginWithBackend(email: string, password: string): void {
    this.authApiService.login(email, password).subscribe({
      next: (response) => {
        this.tokenService.saveToken(response.token);
        const userData = this.tokenService.getUserFromToken();

        if (userData) {
          const user: UserType = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            createdAt: Date.now(),
          };

          this.saveUserAndNavigate(user);
        } else {
          this.handleAuthError('Invalid token data');
        }
      },
      error: (error) => {
        const errorMessage = error.error?.error || 'Failed to login';
        this.handleAuthError(errorMessage);
      },
    });
  }

  private loginWithMockData(email: string, password: string): void {
    setTimeout(() => {
      const user = userData.find(u => u.email === email && u.password === password);

      if (user) {
        const { password: _, ...secureUser } = user;
        this.saveUserAndNavigate(secureUser as UserType);
      } else {
        this.handleAuthError('Invalid email or password');
      }
    }, 800);
  }

  private registerWithBackend(name: string, email: string, password: string): void {
    this.authApiService.register(name, email, password).subscribe({
      next: () => {
        this.handleRegisterSuccess();
      },
      error: (error) => {
        const errorMessage = error.error?.error || 'Registration failed';
        this.handleAuthError(errorMessage);
      },
    });
  }

  private registerWithMockData(name: string, email: string, password: string): void {
    setTimeout(() => {
      if (userData.some(u => u.email === email)) {
        this.handleAuthError('Email already exists');
        return;
      }

      const newUser: UserType = {
        id: this.generateId(),
        name,
        email,
        password,
        createdAt: Date.now(),
      };

      userData.push(newUser);
      this.handleRegisterSuccess();
    }, 800);
  }

  private getUserByIdFromBackend(userId: string): Observable<UserType | null> {
    return this.authApiService.getUsernameById(userId).pipe(
      map((response) => ({
        id: userId,
        name: response.username,
        email: '',
        createdAt: 0,
      } as UserType)),
      catchError((error) => {
        console.error('Error fetching user:', error);
        return of(null);
      })
    );
  }

  private getUserByIdFromMockData(userId: string): Observable<UserType | null> {
    const user = userData.find(u => u.id === userId);
    if (user) {
      const { password: _, ...secureUser } = user;
      return of(secureUser as UserType);
    }
    return of(null);
  }

  private saveUserAndNavigate(user: UserType): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));

    this.updateState({
      user,
      loading: false,
      error: null,
    });

    this.notificationService.showNotification('Login successful!', 'success');
    this.router.navigate(['/']);
  }

  private handleRegisterSuccess(): void {
    this.updateState({
      loading: false,
      error: null,
    });

    this.notificationService.showNotification('Registration successful! Please login.', 'success');
    this.router.navigate(['/login']);
  }

  private handleAuthError(errorMessage: string): void {
    this.updateState({
      loading: false,
      error: errorMessage,
    });

    this.notificationService.showNotification(errorMessage, 'error');
  }

  private getInitialState(): AuthState {
    return {
      ...initialState,
      user: this.getStoredUser(),
    };
  }

  private getStoredUser(): UserType | null {
    const storedUser = localStorage.getItem(this.STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  }

  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  private updateState(partialState: Partial<AuthState>): void {
    this.authSubject.next({
      ...this.currentState,
      ...partialState,
    });
  }
}
