import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthStoreService } from '@core/store/auth-store.service';
import { ValidationService } from '@shared/services/validation.service';
import { NotificationService } from '@shared/services/notification.service';
import { Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ElementRef } from '@angular/core';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authStoreMock: jasmine.SpyObj<AuthStoreService>;
  let validationServiceMock: jasmine.SpyObj<ValidationService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;

  interface InputElementMock {
    focus: jasmine.Spy;
  }

  let nameInputMock: InputElementMock;
  let emailInputMock: InputElementMock;
  let passwordInputMock: InputElementMock;
  let confirmPasswordInputMock: InputElementMock;

  beforeEach(async () => {
    nameInputMock = { focus: jasmine.createSpy('nameFocus') };
    emailInputMock = { focus: jasmine.createSpy('emailFocus') };
    passwordInputMock = { focus: jasmine.createSpy('passwordFocus') };
    confirmPasswordInputMock = { focus: jasmine.createSpy('confirmPasswordFocus') };

    authStoreMock = jasmine.createSpyObj('AuthStoreService', ['register'], {
      error$: new Subject<string>(),
      loading$: new Subject<boolean>(),
    });

    validationServiceMock = jasmine.createSpyObj('ValidationService', [
      'validateRequired',
      'validateEmail',
      'validatePassword',
      'validatePasswordsMatch',
    ]);

    notificationServiceMock = jasmine.createSpyObj('NotificationService', ['showNotification']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, FormsModule],
      providers: [
        { provide: AuthStoreService, useValue: authStoreMock },
        { provide: ValidationService, useValue: validationServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;

    component.nameInput = { nativeElement: nameInputMock } as unknown as ElementRef;
    component.emailInput = { nativeElement: emailInputMock } as unknown as ElementRef;
    component.passwordInput = { nativeElement: passwordInputMock } as unknown as ElementRef;
    component.confirmPasswordInput = { nativeElement: confirmPasswordInputMock } as unknown as ElementRef;

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

  describe('Input Handling', () => {
    it('should update name property on onNameInput', () => {
      const event = { target: { value: 'John Doe' } } as unknown as Event;
      component.onNameInput(event);
      expect(component.name).toBe('John Doe');
    });

    it('should update email property on onEmailInput', () => {
      const event = { target: { value: 'test@example.com' } } as unknown as Event;
      component.onEmailInput(event);
      expect(component.email).toBe('test@example.com');
    });

    it('should update password property on onPasswordInput', () => {
      const event = { target: { value: 'Password123!' } } as unknown as Event;
      component.onPasswordInput(event);
      expect(component.password).toBe('Password123!');
    });

    it('should update confirmPassword property on onConfirmPasswordInput', () => {
      const event = { target: { value: 'Password123!' } } as unknown as Event;
      component.onConfirmPasswordInput(event);
      expect(component.confirmPassword).toBe('Password123!');
    });
  });

  describe('onSubmit', () => {
    it('should call authStore.register if all validations pass', () => {
      component.name = 'John Doe';
      component.email = 'test@example.com';
      component.password = 'Password123!';
      component.confirmPassword = 'Password123!';

      validationServiceMock.validateRequired.and.returnValue(true);
      validationServiceMock.validateEmail.and.returnValue(true);
      validationServiceMock.validatePassword.and.returnValue(true);
      validationServiceMock.validatePasswordsMatch.and.returnValue(true);

      component.onSubmit();

      expect(authStoreMock.register).toHaveBeenCalledWith('John Doe', 'test@example.com', 'Password123!');
    });

    it('should show error notification when name is empty', () => {
      component.name = '';
      component.email = 'test@example.com';
      component.password = 'Password123!';
      component.confirmPassword = 'Password123!';

      validationServiceMock.validateRequired.and.callFake((value: string) => value.length > 0);

      component.onSubmit();

      expect(component.errorMessage).toBe('Username is required');
      expect(notificationServiceMock.showNotification).toHaveBeenCalledWith('Username is required', 'error');
      expect(authStoreMock.register).not.toHaveBeenCalled();

      nameInputMock.focus();
      expect(nameInputMock.focus).toHaveBeenCalled();
    });

    it('should show error notification when email is empty', () => {
      component.name = 'John Doe';
      component.email = '';
      component.password = 'Password123!';
      component.confirmPassword = 'Password123!';

      validationServiceMock.validateRequired.and.callFake((value: string) => {
        if (value === 'John Doe') return true;
        return value.length > 0;
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('Email is required');
      expect(notificationServiceMock.showNotification).toHaveBeenCalledWith('Email is required', 'error');
      expect(authStoreMock.register).not.toHaveBeenCalled();

      emailInputMock.focus();
      expect(emailInputMock.focus).toHaveBeenCalled();
    });

    it('should show error notification when email format is invalid', () => {
      component.name = 'John Doe';
      component.email = 'invalid-email';
      component.password = 'Password123!';
      component.confirmPassword = 'Password123!';

      validationServiceMock.validateRequired.and.returnValue(true);
      validationServiceMock.validateEmail.and.returnValue(false);

      component.onSubmit();

      expect(component.errorMessage).toBe('Invalid email format');
      expect(notificationServiceMock.showNotification).toHaveBeenCalledWith('Invalid email format', 'error');
      expect(authStoreMock.register).not.toHaveBeenCalled();

      emailInputMock.focus();
      expect(emailInputMock.focus).toHaveBeenCalled();
    });

    it('should show error notification when password is empty', () => {
      component.name = 'John Doe';
      component.email = 'test@example.com';
      component.password = '';
      component.confirmPassword = 'Password123!';

      validationServiceMock.validateRequired.and.callFake((value: string) => {
        if (value === '' && (value === component.password)) return false;
        return true;
      });
      validationServiceMock.validateEmail.and.returnValue(true);

      component.onSubmit();

      expect(component.errorMessage).toBe('Password is required');
      expect(notificationServiceMock.showNotification).toHaveBeenCalledWith('Password is required', 'error');
      expect(authStoreMock.register).not.toHaveBeenCalled();

      passwordInputMock.focus();
      expect(passwordInputMock.focus).toHaveBeenCalled();
    });

    it('should show error notification when password format is invalid', () => {
      component.name = 'John Doe';
      component.email = 'test@example.com';
      component.password = 'weak';
      component.confirmPassword = 'weak';

      validationServiceMock.validateRequired.and.returnValue(true);
      validationServiceMock.validateEmail.and.returnValue(true);
      validationServiceMock.validatePassword.and.returnValue(false);

      component.onSubmit();

      expect(component.errorMessage).toBe('Password must be at least 8 characters long, include one uppercase letter, one number, and one special character');
      expect(notificationServiceMock.showNotification).toHaveBeenCalledWith(
        'Password must be at least 8 characters long, include one uppercase letter, one number, and one special character',
        'error'
      );
      expect(authStoreMock.register).not.toHaveBeenCalled();

      passwordInputMock.focus();
      expect(passwordInputMock.focus).toHaveBeenCalled();
    });

    it('should show error notification when confirmPassword is empty', () => {
      component.name = 'John Doe';
      component.email = 'test@example.com';
      component.password = 'Password123!';
      component.confirmPassword = '';

      validationServiceMock.validateRequired.and.callFake((value: string) => {
        if (value === '' && (value === component.confirmPassword)) return false;
        return true;
      });
      validationServiceMock.validateEmail.and.returnValue(true);
      validationServiceMock.validatePassword.and.returnValue(true);

      component.onSubmit();

      expect(component.errorMessage).toBe('Please confirm your password');
      expect(notificationServiceMock.showNotification).toHaveBeenCalledWith('Please confirm your password', 'error');
      expect(authStoreMock.register).not.toHaveBeenCalled();

      confirmPasswordInputMock.focus();
      expect(confirmPasswordInputMock.focus).toHaveBeenCalled();
    });

    it('should show error notification when passwords do not match', () => {
      component.name = 'John Doe';
      component.email = 'test@example.com';
      component.password = 'Password123!';
      component.confirmPassword = 'DifferentPassword123!';

      validationServiceMock.validateRequired.and.returnValue(true);
      validationServiceMock.validateEmail.and.returnValue(true);
      validationServiceMock.validatePassword.and.returnValue(true);
      validationServiceMock.validatePasswordsMatch.and.returnValue(false);

      component.onSubmit();

      expect(component.errorMessage).toBe('Passwords do not match');
      expect(notificationServiceMock.showNotification).toHaveBeenCalledWith('Passwords do not match', 'warning');
      expect(authStoreMock.register).not.toHaveBeenCalled();

      confirmPasswordInputMock.focus();
      expect(confirmPasswordInputMock.focus).toHaveBeenCalled();
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
