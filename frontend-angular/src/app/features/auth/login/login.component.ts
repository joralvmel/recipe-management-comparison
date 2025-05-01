import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
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
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    setTimeout(() => {
      const success = this.authService.login(this.email, this.password);
      this.isLoading = false;

      if (success) {
        this.router.navigate(['/']);
      } else {
        this.errorMessage = 'Invalid email or password';
      }
    }, 800);
  }
}
