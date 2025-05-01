import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { FormComponent } from '@shared/components/form/form.component';
import { FormGroupComponent } from '@shared/components/form-group/form-group.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormComponent,
    FormGroupComponent,
  ],
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill out all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    setTimeout(() => {
      const success = this.authService.register(this.name, this.email, this.password);
      this.isLoading = false;

      if (success) {
        this.router.navigate(['/login']);
      } else {
        this.errorMessage = 'Registration failed. Email might already be in use.';
      }
    }, 800);
  }
}
