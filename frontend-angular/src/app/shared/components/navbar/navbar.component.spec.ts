import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import { NavbarComponent } from './navbar.component';
import { AuthStoreService } from '@core/store/auth-store.service';
import { UserType } from '@models/user.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authStoreMock: jasmine.SpyObj<AuthStoreService>;
  let isAuthenticatedSubject: BehaviorSubject<boolean>;
  let userSubject: BehaviorSubject<UserType | null>;

  const mockUser: UserType = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: Date.now(),
    password: 'password123'
  };

  beforeEach(async () => {
    isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    userSubject = new BehaviorSubject<UserType | null>(null);

    authStoreMock = jasmine.createSpyObj('AuthStoreService', ['logout'], {
      isAuthenticated$: isAuthenticatedSubject.asObservable(),
      user$: userSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NavbarComponent
      ],
      providers: [
        { provide: AuthStoreService, useValue: authStoreMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should have default values', () => {
      expect(component.isMobileMenuOpen).toBeFalse();
      expect(component.isAuthenticated).toBeFalse();
      expect(component.currentUser).toBeNull();
    });

    it('should subscribe to auth state on init', () => {
      isAuthenticatedSubject.next(true);
      fixture.detectChanges();

      expect(component.isAuthenticated).toBeTrue();
    });

    it('should subscribe to user state on init', () => {
      userSubject.next(mockUser);
      fixture.detectChanges();

      expect(component.currentUser).toBe(mockUser);
    });
  });

  describe('mobile menu functionality', () => {
    it('should toggle mobile menu when toggleMobileMenu is called', () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);

      component.toggleMobileMenu(mockEvent);
      expect(component.isMobileMenuOpen).toBeTrue();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      component.toggleMobileMenu(mockEvent);
      expect(component.isMobileMenuOpen).toBeFalse();
    });

    it('should close mobile menu when clicking outside', () => {
      component.isMobileMenuOpen = true;

      const menuIconElement = document.createElement('div');
      const mobileMenuElement = document.createElement('div');
      const outsideElement = document.createElement('div');
      const elementRefProp = 'elementRef';
      const querySelectorProp = 'querySelector';

      spyOn(component[elementRefProp].nativeElement, querySelectorProp)
        .withArgs('.menu-icon').and.returnValue(menuIconElement)
        .withArgs('.mobile-menu').and.returnValue(mobileMenuElement);

      const clickEvent = new MouseEvent('click');
      Object.defineProperty(clickEvent, 'target', { value: outsideElement });

      component.onDocumentClick(clickEvent);

      expect(component.isMobileMenuOpen).toBeFalse();
    });

    it('should not close mobile menu when clicking inside the menu', () => {
      component.isMobileMenuOpen = true;

      const menuIconElement = document.createElement('div');
      const mobileMenuElement = document.createElement('div');

      const elementRefProp = 'elementRef';
      const querySelectorProp = 'querySelector';

      spyOn(component[elementRefProp].nativeElement, querySelectorProp)
        .withArgs('.menu-icon').and.returnValue(menuIconElement)
        .withArgs('.mobile-menu').and.returnValue(mobileMenuElement);

      const clickEvent = new MouseEvent('click');
      Object.defineProperty(clickEvent, 'target', { value: mobileMenuElement });

      component.onDocumentClick(clickEvent);

      expect(component.isMobileMenuOpen).toBeTrue();
    });
  });

  describe('authentication functionality', () => {
    it('should display different content based on authentication state', () => {
      isAuthenticatedSubject.next(false);
      fixture.detectChanges();
      expect(component.isAuthenticated).toBeFalse();

      isAuthenticatedSubject.next(true);
      userSubject.next(mockUser);
      fixture.detectChanges();
      expect(component.isAuthenticated).toBeTrue();
      expect(component.currentUser).toBe(mockUser);
    });

    it('should call logout when logout method is called', () => {
      component.logout();

      expect(authStoreMock.logout).toHaveBeenCalled();
      expect(component.isMobileMenuOpen).toBeFalse();
    });

    it('should call logout when logout method is called', () => {
      component.logout();

      expect(authStoreMock.logout).toHaveBeenCalled();
      expect(component.isMobileMenuOpen).toBeFalse();
    });
  });

  describe('lifecycle hooks', () => {
    it('should unsubscribe from all subscriptions on destroy', () => {
      const subscriptionsProp = 'subscriptions';
      const unsubscribeProp = 'unsubscribe';
      const unsubscribeSpy = spyOn(component[subscriptionsProp], unsubscribeProp);

      component.ngOnDestroy();

      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });
});
