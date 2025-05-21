import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { AuthStoreService } from '@core/store/auth-store.service';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { NotificationService } from '@shared/services/notification.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authStoreSpy: jasmine.SpyObj<AuthStoreService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    const authStoreSpyObj = jasmine.createSpyObj('AuthStoreService', [], { isAuthenticated: false });
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const notificationSpyObj = jasmine.createSpyObj('NotificationService', ['showNotification']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthStoreService, useValue: authStoreSpyObj },
        { provide: Router, useValue: routerSpyObj },
        { provide: NotificationService, useValue: notificationSpyObj }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authStoreSpy = TestBed.inject(AuthStoreService) as jasmine.SpyObj<AuthStoreService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    notificationSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;

    mockRoute = new ActivatedRouteSnapshot();
    mockState = { url: '/protected-route' } as RouterStateSnapshot;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true when user is authenticated', () => {
      Object.defineProperty(authStoreSpy, 'isAuthenticated', { get: () => true });

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBeTrue();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(notificationSpy.showNotification).not.toHaveBeenCalled();
    });

    it('should return false, redirect to home, and show notification when user is not authenticated', () => {
      Object.defineProperty(authStoreSpy, 'isAuthenticated', { get: () => false });

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
      expect(notificationSpy.showNotification).toHaveBeenCalledWith(
        'You must be logged in to access this page',
        'error'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle different route states correctly', () => {
      Object.defineProperty(authStoreSpy, 'isAuthenticated', { get: () => false });

      const differentState = { url: '/another-route' } as RouterStateSnapshot;
      guard.canActivate(mockRoute, differentState);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
      expect(notificationSpy.showNotification).toHaveBeenCalledWith(
        'You must be logged in to access this page',
        'error'
      );
    });

    it('should handle route with query params', () => {
      Object.defineProperty(authStoreSpy, 'isAuthenticated', { get: () => false });

      const routeWithQuery = new ActivatedRouteSnapshot();
      routeWithQuery.queryParams = { returnUrl: '/dashboard' };

      guard.canActivate(routeWithQuery, mockState);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
