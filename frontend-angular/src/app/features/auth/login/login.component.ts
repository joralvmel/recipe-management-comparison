import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthStoreService } from '@core/store/auth-store.service';
import { FormComponent } from '@shared/components/form/form.component';
import { FormGroupComponent } from '@shared/components/form-group/form-group.component';
import { ValidationService } from '@shared/services/validation.service';
import { NotificationService } from '@shared/services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormComponent,
    FormGroupComponent,
  ],
})
export class LoginComponent implements OnInit, OnDestroy {
  @ViewChild('emailInput') emailInput!: ElementRef;
  @ViewChild('passwordInput') passwordInput!: ElementRef;

  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  private subscriptions = new Subscription();

  constructor(
    private authStore: AuthStoreService,
    private validationService: ValidationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.authStore.error$.subscribe(error => {
        this.errorMessage = error || '';
      })
    );

    this.subscriptions.add(
      this.authStore.loading$.subscribe(loading => {
        this.isLoading = loading;
      })
    );
  }

  onEmailInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.email = target.value;
  }

  onPasswordInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.password = target.value;
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.validationService.validateRequired(this.email)) {
      this.errorMessage = 'Email is required';
      this.notificationService.showNotification('Email is required', 'error');
      setTimeout(() => this.emailInput?.nativeElement?.focus(), 0);
      return;
    }

    if (!this.validationService.validateEmail(this.email)) {
      this.errorMessage = 'Invalid email format';
      this.notificationService.showNotification('Invalid email format', 'error');
      setTimeout(() => this.emailInput?.nativeElement?.focus(), 0);
      return;
    }

    if (!this.validationService.validateRequired(this.password)) {
      this.errorMessage = 'Password is required';
      this.notificationService.showNotification('Password is required', 'error');
      setTimeout(() => this.passwordInput?.nativeElement?.focus(), 0);
      return;
    }

    this.authStore.login(this.email, this.password);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
