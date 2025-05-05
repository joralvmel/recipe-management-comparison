import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, distinctUntilChanged } from 'rxjs/operators';
import { UserType } from '@models/user.model';
import { userData } from '@app/data/mock-users';
import { AuthApiService } from '@core/http/auth-api.service';
import { TokenService } from '@core/services/token.service';
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
  private state$: Observable<AuthState> = this.authSubject.asObservable();
  private useBackend = process.env.USE_BACKEND === 'true';

  constructor(
    private router: Router,
    private authApiService: AuthApiService,
    private tokenService: TokenService,
    private notificationService: NotificationService,
  ) {}

  get user$(): Observable<UserType | null> {
    return this.state$.pipe(
      map((state) => state.user),
      distinctUntilChanged(),
    );
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.state$.pipe(
      map((state) => !!state.user),
      distinctUntilChanged(),
    );
  }

  get loading$(): Observable<boolean> {
    return this.state$.pipe(
      map((state) => state.loading),
      distinctUntilChanged(),
    );
  }

  get error$(): Observable<string | null> {
    return this.state$.pipe(
      map((state) => state.error),
      distinctUntilChanged(),
    );
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

    if (this.useBackend) {
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

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
            this.updateState({
              user,
              loading: false,
              error: null,
            });

            this.notificationService.showNotification('Login successful!', 'success');
            this.router.navigate(['/']);
          } else {
            this.updateState({
              loading: false,
              error: 'Invalid token data',
            });
            this.notificationService.showNotification('Invalid token data', 'error');
          }
        },
        error: (error) => {
          const errorMessage = error.error?.error || 'Failed to login';
          this.updateState({
            loading: false,
            error: errorMessage,
          });
          this.notificationService.showNotification(errorMessage, 'error');
        },
      });
    } else {
      setTimeout(() => {
        const user = userData.find(
          (u) => u.email === email && u.password === password,
        );

        if (user) {
          const { password: _, ...secureUser } = user;
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(secureUser));
          this.updateState({
            user: secureUser as UserType,
            loading: false,
            error: null,
          });

          this.notificationService.showNotification('Login successful!', 'success');
          this.router.navigate(['/']);
        } else {
          const errorMessage = 'Invalid email or password';
          this.updateState({
            loading: false,
            error: errorMessage,
          });
          this.notificationService.showNotification(errorMessage, 'error');
        }
      }, 800);
    }
  }

  register(name: string, email: string, password: string): void {
    this.updateState({ loading: true, error: null });

    if (this.useBackend) {
      this.authApiService.register(name, email, password).subscribe({
        next: () => {
          this.updateState({
            loading: false,
            error: null,
          });
          this.notificationService.showNotification('Registration successful! Please login.', 'success');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          const errorMessage = error.error?.error || 'Registration failed';
          this.updateState({
            loading: false,
            error: errorMessage,
          });
          this.notificationService.showNotification(errorMessage, 'error');
        },
      });
    } else {
      setTimeout(() => {
        if (userData.some((u) => u.email === email)) {
          const errorMessage = 'Email already exists';
          this.updateState({
            loading: false,
            error: errorMessage,
          });
          this.notificationService.showNotification(errorMessage, 'error');
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

        this.updateState({
          loading: false,
          error: null,
        });

        this.notificationService.showNotification('Registration successful! Please login.', 'success');
        this.router.navigate(['/login']);
      }, 800);
    }
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
          const user: UserType = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            createdAt: Date.now(),
          };
          this.updateState({ user });
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

    if (this.useBackend) {
      return this.authApiService.getUsernameById(userId).pipe(
        map((response) => {
          return {
            id: userId,
            name: response.username,
            email: '',
            createdAt: 0,
          } as UserType;
        }),
        catchError((error) => {
          console.error('Error fetching user:', error);
          return of(null);
        }),
      );
    }

    const user = userData.find((u) => u.id === userId);
    if (user) {
      const { password: _, ...secureUser } = user;
      return of(secureUser as UserType);
    }
    return of(null);
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
