import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthStoreService, AuthState } from './auth-store.service';
import { AuthApiService } from '@core/http/auth-api.service';
import { TokenService } from '@shared/services/token.service';
import { NotificationService } from '@shared/services/notification.service';
import { UserType } from '@models/user.model';
import { userData } from '@app/data/mock-users';
import { of, throwError } from 'rxjs';
import { first } from 'rxjs/operators';

interface RegisterResponse {
  id: string;
  name: string;
  email: string;
}

interface UsernameResponse {
  username: string;
}

interface TokenData {
  id: string;
  name: string;
  email: string;
}

interface LoginErrorResponse {
  error: { error: string };
}

interface AuthStoreServicePrivate {
  updateState: (partialState: Partial<AuthState>) => void;
  generateId: () => string;
  getStoredUser: () => UserType | null;
  saveUserAndNavigate: (user: UserType) => void;
  handleRegisterSuccess: () => void;
  handleAuthError: (errorMessage: string) => void;
  useBackend: boolean;
}

describe('AuthStoreService', () => {
  let service: AuthStoreService;
  let servicePrivate: AuthStoreServicePrivate;
  let routerSpy: jasmine.SpyObj<Router>;
  let authApiServiceSpy: jasmine.SpyObj<AuthApiService>;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  const STORAGE_KEY = 'gastronest_user';

  const mockUser: UserType = {
    id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: 1620000000000
  };

  const mockToken = 'mock.jwt.token';
  const mockTokenData: TokenData = {
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email
  };

  const mockAuthResponse = {
    token: mockToken,
    user: {
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email
    }
  };

  beforeEach(() => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const authApiSpyObj = jasmine.createSpyObj('AuthApiService', ['login', 'register', 'getUsernameById']);
    const tokenSpyObj = jasmine.createSpyObj('TokenService', ['saveToken', 'removeToken', 'isTokenValid', 'getUserFromToken']);
    const notificationSpyObj = jasmine.createSpyObj('NotificationService', ['showNotification']);

    TestBed.configureTestingModule({
      providers: [
        AuthStoreService,
        { provide: Router, useValue: routerSpyObj },
        { provide: AuthApiService, useValue: authApiSpyObj },
        { provide: TokenService, useValue: tokenSpyObj },
        { provide: NotificationService, useValue: notificationSpyObj }
      ]
    });

    service = TestBed.inject(AuthStoreService);
    servicePrivate = service as unknown as AuthStoreServicePrivate;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authApiServiceSpy = TestBed.inject(AuthApiService) as jasmine.SpyObj<AuthApiService>;
    tokenServiceSpy = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;

    servicePrivate.useBackend = false;

    authApiServiceSpy.login.and.returnValue(of(mockAuthResponse));
    authApiServiceSpy.register.and.returnValue(of({
      id: 'newuser',
      name: 'New User',
      email: 'new@example.com'
    } as RegisterResponse));
    authApiServiceSpy.getUsernameById.and.returnValue(of({
      username: mockUser.name
    } as UsernameResponse));

    tokenServiceSpy.isTokenValid.and.returnValue(true);
    tokenServiceSpy.getUserFromToken.and.returnValue(mockTokenData);

    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem').and.callFake(() => {});
    spyOn(localStorage, 'removeItem').and.callFake(() => {});
  });

  afterEach(() => {
    (localStorage.getItem as jasmine.Spy).calls.reset();
    (localStorage.setItem as jasmine.Spy).calls.reset();
    (localStorage.removeItem as jasmine.Spy).calls.reset();
    servicePrivate.useBackend = false;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Observable Streams', () => {
    it('should emit user when user state changes', (done) => {
      servicePrivate.updateState({ user: mockUser });

      service.user$.pipe(first()).subscribe(user => {
        expect(user).toEqual(mockUser);
        done();
      });
    });

    it('should emit authentication status when user state changes', (done) => {
      servicePrivate.updateState({ user: mockUser });

      service.isAuthenticated$.pipe(first()).subscribe(isAuthenticated => {
        expect(isAuthenticated).toBeTrue();
        done();
      });
    });

    it('should emit loading status when loading state changes', (done) => {
      servicePrivate.updateState({ loading: true });

      service.loading$.pipe(first()).subscribe(loading => {
        expect(loading).toBeTrue();
        done();
      });
    });

    it('should emit error when error state changes', (done) => {
      const errorMessage = 'Test error';
      servicePrivate.updateState({ error: errorMessage });

      service.error$.pipe(first()).subscribe(error => {
        expect(error).toEqual(errorMessage);
        done();
      });
    });
  });

  describe('Getters', () => {
    it('should return current state', () => {
      servicePrivate.updateState({ user: mockUser });
      const state = service.currentState;
      expect(state.user).toEqual(mockUser);
    });

    it('should return current user', () => {
      servicePrivate.updateState({ user: mockUser });
      expect(service.currentUser).toEqual(mockUser);
    });

    it('should return isAuthenticated as true when user exists', () => {
      servicePrivate.updateState({ user: mockUser });
      expect(service.isAuthenticated).toBeTrue();
    });

    it('should return isAuthenticated as false when user is null', () => {
      servicePrivate.updateState({ user: null });
      expect(service.isAuthenticated).toBeFalse();
    });
  });

  describe('Login', () => {
    describe('with backend', () => {
      beforeEach(() => {
        servicePrivate.useBackend = true;
      });

      it('should call authApiService.login and handle successful response', () => {
        service.login('test@example.com', 'password');

        expect(service.currentState.loading).toBeFalse();
        expect(authApiServiceSpy.login).toHaveBeenCalledWith('test@example.com', 'password');
        expect(tokenServiceSpy.saveToken).toHaveBeenCalledWith(mockToken);
        expect(localStorage.setItem).toHaveBeenCalled();
        expect(service.currentUser).toBeTruthy();
        expect(service.currentUser?.email).toEqual(mockUser.email);
        expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith('Login successful!', 'success');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
      });

      it('should handle login error', () => {
        const errorMessage = 'Invalid credentials';
        authApiServiceSpy.login.and.returnValue(throwError(() => ({
          error: { error: errorMessage }
        } as LoginErrorResponse)));

        service.login('test@example.com', 'wrongpassword');

        expect(authApiServiceSpy.login).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
        expect(service.currentState.loading).toBeFalse();
        expect(service.currentState.error).toEqual(errorMessage);
        expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(errorMessage, 'error');
      });

      it('should handle invalid token data', () => {
        tokenServiceSpy.getUserFromToken.and.returnValue(null);

        service.login('test@example.com', 'password');

        expect(authApiServiceSpy.login).toHaveBeenCalled();
        expect(service.currentState.loading).toBeFalse();
        expect(service.currentState.error).toEqual('Invalid token data');
        expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith('Invalid token data', 'error');
      });
    });

    describe('without backend', () => {
      it('should login with mock data on success', fakeAsync(() => {
        const mockUserWithPassword = {
          ...mockUser,
          password: 'password'
        };
        userData.push(mockUserWithPassword);

        service.login('test@example.com', 'password');
        expect(service.currentState.loading).toBeTrue();

        tick(800);

        expect(service.currentState.loading).toBeFalse();
        expect(service.currentUser?.email).toEqual(mockUser.email);
        expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith('Login successful!', 'success');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);

        const userIndex = userData.findIndex(u => u.email === mockUser.email);
        if (userIndex >= 0) userData.splice(userIndex, 1);
      }));

      it('should handle login failure with mock data', fakeAsync(() => {
        service.login('test@example.com', 'wrongpassword');
        expect(service.currentState.loading).toBeTrue();

        tick(800);

        expect(service.currentState.loading).toBeFalse();
        expect(service.currentState.error).toEqual('Invalid email or password');
        expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith('Invalid email or password', 'error');
      }));
    });
  });

  describe('Register', () => {
    describe('with backend', () => {
      beforeEach(() => {
        servicePrivate.useBackend = true;
      });

      it('should call authApiService.register and handle successful response', () => {
        service.register('Test User', 'test@example.com', 'password');

        expect(authApiServiceSpy.register).toHaveBeenCalledWith('Test User', 'test@example.com', 'password');
        expect(service.currentState.loading).toBeFalse();
        expect(service.currentState.error).toBeNull();
        expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith('Registration successful! Please login.', 'success');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      });

      it('should handle registration error', () => {
        const errorMessage = 'Email already exists';
        authApiServiceSpy.register.and.returnValue(throwError(() => ({
          error: { error: errorMessage }
        } as LoginErrorResponse)));

        service.register('Test User', 'test@example.com', 'password');

        expect(authApiServiceSpy.register).toHaveBeenCalled();
        expect(service.currentState.loading).toBeFalse();
        expect(service.currentState.error).toEqual(errorMessage);
        expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(errorMessage, 'error');
      });
    });

    describe('without backend', () => {
      it('should register with mock data on success', fakeAsync(() => {
        spyOn(servicePrivate, 'generateId').and.returnValue('newuser123');

        service.register('New User', 'newuser@example.com', 'password');
        expect(service.currentState.loading).toBeTrue();

        tick(800);

        expect(service.currentState.loading).toBeFalse();
        expect(service.currentState.error).toBeNull();

        const newUser = userData.find(u => u.email === 'newuser@example.com');
        expect(newUser).toBeTruthy();
        expect(newUser?.name).toEqual('New User');

        expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith('Registration successful! Please login.', 'success');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);

        const userIndex = userData.findIndex(u => u.email === 'newuser@example.com');
        if (userIndex >= 0) userData.splice(userIndex, 1);
      }));

      it('should handle registration failure when email already exists', fakeAsync(() => {
        userData.push({
          id: 'existinguser',
          name: 'Existing User',
          email: 'existing@example.com',
          password: 'password',
          createdAt: Date.now()
        });

        service.register('Another User', 'existing@example.com', 'password');
        expect(service.currentState.loading).toBeTrue();

        tick(800);

        expect(service.currentState.loading).toBeFalse();
        expect(service.currentState.error).toEqual('Email already exists');
        expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith('Email already exists', 'error');

        const userIndex = userData.findIndex(u => u.email === 'existing@example.com');
        if (userIndex >= 0) userData.splice(userIndex, 1);
      }));
    });
  });

  describe('Logout', () => {
    it('should clear token, remove user from storage and navigate to home', () => {
      servicePrivate.updateState({ user: mockUser });

      service.logout();

      expect(tokenServiceSpy.removeToken).toHaveBeenCalled();
      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(service.currentUser).toBeNull();
      expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith('Logged out successfully!', 'info');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('loadUserFromStorage', () => {
    describe('with backend', () => {
      beforeEach(() => {
        servicePrivate.useBackend = true;
      });

      it('should load user from token when token is valid', () => {
        tokenServiceSpy.isTokenValid.and.returnValue(true);
        tokenServiceSpy.getUserFromToken.and.returnValue(mockTokenData);

        service.loadUserFromStorage();

        expect(tokenServiceSpy.isTokenValid).toHaveBeenCalled();
        expect(tokenServiceSpy.getUserFromToken).toHaveBeenCalled();
        expect(service.currentUser?.id).toEqual(mockUser.id);
        expect(service.currentUser?.name).toEqual(mockUser.name);
      });

      it('should not do anything when token is invalid', () => {
        tokenServiceSpy.isTokenValid.and.returnValue(false);
        spyOn(service, 'logout');

        service.loadUserFromStorage();

        expect(tokenServiceSpy.isTokenValid).toHaveBeenCalled();
        expect(service.logout).not.toHaveBeenCalled();
      });

      it('should logout when token data is invalid', () => {
        tokenServiceSpy.isTokenValid.and.returnValue(true);
        tokenServiceSpy.getUserFromToken.and.returnValue(null);
        spyOn(service, 'logout');

        service.loadUserFromStorage();

        expect(tokenServiceSpy.isTokenValid).toHaveBeenCalled();
        expect(tokenServiceSpy.getUserFromToken).toHaveBeenCalled();
        expect(service.logout).toHaveBeenCalled();
      });
    });

    describe('without backend', () => {
      it('should load user from localStorage', () => {
        const storedUserString = JSON.stringify(mockUser);
        (localStorage.getItem as jasmine.Spy).and.returnValue(storedUserString);

        service.loadUserFromStorage();

        expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
        expect(service.currentUser).toEqual(mockUser);
      });

      it('should not load user if localStorage is empty', () => {
        (localStorage.getItem as jasmine.Spy).and.returnValue(null);

        service.loadUserFromStorage();

        expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
        expect(service.currentUser).toBeNull();
      });
    });
  });

  describe('getUserById', () => {
    it('should return current user if IDs match', (done) => {
      servicePrivate.updateState({ user: mockUser });

      service.getUserById(mockUser.id).subscribe(user => {
        expect(user).toEqual(mockUser);
        done();
      });
    });

    describe('with backend', () => {
      beforeEach(() => {
        servicePrivate.useBackend = true;
      });

      it('should call API to get user by ID', (done) => {
        const userId = 'otheruserId';
        authApiServiceSpy.getUsernameById.and.returnValue(of({ username: 'Other User' }));

        service.getUserById(userId).subscribe(user => {
          expect(authApiServiceSpy.getUsernameById).toHaveBeenCalledWith(userId);
          expect(user?.id).toEqual(userId);
          expect(user?.name).toEqual('Other User');
          done();
        });
      });

      it('should handle error when fetching user by ID', (done) => {
        const userId = 'nonexistentUser';
        authApiServiceSpy.getUsernameById.and.returnValue(throwError(() => new Error('User not found')));
        spyOn(console, 'error');

        service.getUserById(userId).subscribe(user => {
          expect(authApiServiceSpy.getUsernameById).toHaveBeenCalledWith(userId);
          expect(console.error).toHaveBeenCalled();
          expect(user).toBeNull();
          done();
        });
      });
    });

    describe('without backend', () => {
      it('should find user in mock data', (done) => {
        interface MockUserWithPassword extends UserType {
          password: string;
        }

        const mockUser2: MockUserWithPassword = {
          id: 'user2',
          name: 'Another User',
          email: 'another@example.com',
          password: 'password',
          createdAt: Date.now()
        };
        userData.push(mockUser2);

        service.getUserById('user2').subscribe(user => {
          expect(user?.id).toEqual('user2');
          expect(user?.name).toEqual('Another User');
          expect(user?.email).toEqual('another@example.com');

          const userWithOptionalPassword = user as unknown as { password?: string };
          expect(userWithOptionalPassword.password).toBeUndefined();

          done();
        });

        const userIndex = userData.findIndex(u => u.id === 'user2');
        if (userIndex >= 0) userData.splice(userIndex, 1);
      });

      it('should return null for non-existent user', (done) => {
        service.getUserById('nonexistentUser').subscribe(user => {
          expect(user).toBeNull();
          done();
        });
      });
    });
  });

  describe('Private Methods', () => {
    it('should update state correctly', () => {
      const initialState = service.currentState;
      servicePrivate.updateState({ loading: true });

      expect(service.currentState.loading).toBeTrue();
      expect(service.currentState.user).toEqual(initialState.user);
    });

    it('should generate unique IDs', () => {
      const id1 = servicePrivate.generateId();
      const id2 = servicePrivate.generateId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toEqual(id2);
    });

    it('should get stored user from localStorage', () => {
      const storedUserString = JSON.stringify(mockUser);
      (localStorage.getItem as jasmine.Spy).and.returnValue(storedUserString);

      const user = servicePrivate.getStoredUser();

      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(user).toEqual(mockUser);
    });

    it('should return null when no user in localStorage', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);

      const user = servicePrivate.getStoredUser();

      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(user).toBeNull();
    });

    it('should save user and navigate', () => {
      servicePrivate.saveUserAndNavigate(mockUser);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify(mockUser)
      );
      expect(service.currentUser).toEqual(mockUser);
      expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith('Login successful!', 'success');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle register success', () => {
      servicePrivate.handleRegisterSuccess();

      expect(service.currentState.loading).toBeFalse();
      expect(service.currentState.error).toBeNull();
      expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith('Registration successful! Please login.', 'success');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle auth error', () => {
      const errorMessage = 'Test error';
      servicePrivate.handleAuthError(errorMessage);

      expect(service.currentState.loading).toBeFalse();
      expect(service.currentState.error).toEqual(errorMessage);
      expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith(errorMessage, 'error');
    });
  });
});
