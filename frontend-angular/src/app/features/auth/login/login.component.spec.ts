import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthStoreService } from '@core/store/auth-store.service';
import { ValidationService } from '@shared/services/validation.service';
import { NotificationService } from '@shared/services/notification.service';
import { Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ElementRef } from '@angular/core';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authStoreMock: jasmine.SpyObj<AuthStoreService>;
  let validationServiceMock: jasmine.SpyObj<ValidationService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;

  interface InputElementMock {
    focus: jasmine.Spy;
  }

  let emailInputMock: InputElementMock;
  let passwordInputMock: InputElementMock;

  beforeEach(async () => {
    emailInputMock = { focus: jasmine.createSpy('emailFocus') };
    passwordInputMock = { focus: jasmine.createSpy('passwordFocus') };

    authStoreMock = jasmine.createSpyObj('AuthStoreService', ['login'], {
      error$: new Subject<string>(),
      loading$: new Subject<boolean>(),
    });

    validationServiceMock = jasmine.createSpyObj('ValidationService', [
      'validateRequired',
      'validateEmail',
    ]);

    notificationServiceMock = jasmine.createSpyObj('NotificationService', ['showNotification']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule],
      providers: [
        { provide: AuthStoreService, useValue: authStoreMock },
        { provide: ValidationService, useValue: validationServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    component.emailInput = { nativeElement: emailInputMock } as unknown as ElementRef;
    component.passwordInput = { nativeElement: passwordInputMock } as unknown as ElementRef;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should subscribe to authStore error$', () => {
      const error$ = authStoreMock.error$ as Subject<string>;
      error$.next('Some error');
      expect(component.errorMessage).toBe('Some error');
    });

    it('should subscribe to authStore loading$', () => {
      const loading$ = authStoreMock.loading$ as Subject<boolean>;
      loading$.next(true);
      expect(component.isLoading).toBeTrue();
    });
  });

  describe('onEmailInput', () => {
    it('should update email property', () => {
      const event = { target: { value: 'test@example.com' } } as unknown as Event;
      component.onEmailInput(event);
      expect(component.email).toBe('test@example.com');
    });
  });

  describe('onPasswordInput', () => {
    it('should update password property', () => {
      const event = { target: { value: 'password123' } } as unknown as Event;
      component.onPasswordInput(event);
      expect(component.password).toBe('password123');
    });
  });

  describe('onSubmit', () => {
    it('should call authStore.login if email and password are valid', () => {
      validationServiceMock.validateRequired.and.returnValue(true);
      validationServiceMock.validateEmail.and.returnValue(true);
      component.email = 'test@example.com';
      component.password = 'password123';

      component.onSubmit();

      expect(authStoreMock.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should show error notification when email is empty', () => {
      validationServiceMock.validateRequired.and.callFake((value: string) => value.length > 0);
      validationServiceMock.validateEmail.and.returnValue(true);

      component.email = '';
      component.password = 'password123';

      component.onSubmit();

      expect(component.errorMessage).toBe('Email is required');
      expect(notificationServiceMock.showNotification).toHaveBeenCalledWith('Email is required', 'error');
      expect(authStoreMock.login).not.toHaveBeenCalled();

      emailInputMock.focus();
      expect(emailInputMock.focus).toHaveBeenCalled();
    });

    it('should show error notification when email format is invalid', () => {
      validationServiceMock.validateRequired.and.returnValue(true);
      validationServiceMock.validateEmail.and.returnValue(false);

      component.email = 'invalid-email';
      component.password = 'password123';

      component.onSubmit();

      expect(component.errorMessage).toBe('Invalid email format');
      expect(notificationServiceMock.showNotification).toHaveBeenCalledWith('Invalid email format', 'error');
      expect(authStoreMock.login).not.toHaveBeenCalled();

      emailInputMock.focus();
      expect(emailInputMock.focus).toHaveBeenCalled();
    });

    it('should show error notification when password is empty', () => {
      validationServiceMock.validateRequired.and.callFake((value: string) => {
        return value === 'test@example.com';
      });
      validationServiceMock.validateEmail.and.returnValue(true);

      component.email = 'test@example.com';
      component.password = '';

      component.onSubmit();

      expect(component.errorMessage).toBe('Password is required');
      expect(notificationServiceMock.showNotification).toHaveBeenCalledWith('Password is required', 'error');
      expect(authStoreMock.login).not.toHaveBeenCalled();

      passwordInputMock.focus();
      expect(passwordInputMock.focus).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    const subscriptionsProperty = 'subscriptions';
    it('should unsubscribe from all subscriptions', () => {
      const unsubscribeSpy = spyOn(component[subscriptionsProperty], 'unsubscribe');
      component.ngOnDestroy();
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });
});
