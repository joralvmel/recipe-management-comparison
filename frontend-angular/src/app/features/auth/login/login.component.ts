import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthStoreService } from '@core/store/auth-store.service';
import { FormComponent } from '@shared/components/form/form.component';
import { FormGroupComponent } from '@shared/components/form-group/form-group.component';

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
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  private subscriptions = new Subscription();

  constructor(private authStore: AuthStoreService) {}

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

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.authStore.login(this.email, this.password);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
