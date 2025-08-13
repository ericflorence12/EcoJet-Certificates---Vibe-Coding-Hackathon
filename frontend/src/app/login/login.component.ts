import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoginMode = true;
  isLoading = false;
  error = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      companyName: ['', [Validators.required]],
      contactName: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password && confirmPassword && password.value === confirmPassword.value
      ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.isLoginMode) {
      this.onLogin();
    } else {
      this.onRegister();
    }
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.successMessage = '';

      const credentials = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.error = error.error?.message || 'Login failed. Please try again.';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.successMessage = '';

      const { email, password, companyName, contactName } = this.registerForm.value;
      const registerData = {
        email,
        password,
        firstName: contactName.split(' ')[0] || contactName,
        lastName: contactName.split(' ')[1] || '',
        company: companyName
      };

      this.authService.register(registerData).subscribe({
        next: () => {
          this.successMessage = 'Registration successful! Logging you in...';

          // Automatically log in the user after successful registration
          const loginCredentials = { email, password };
          this.authService.login(loginCredentials).subscribe({
            next: () => {
              // Small delay to show the success message before redirecting
              setTimeout(() => {
                this.router.navigate(['/dashboard']);
              }, 1500);
            },
            error: (loginError) => {
              // If auto-login fails, show login form with success message
              this.successMessage = 'Registration successful! Please log in with your credentials.';
              this.isLoginMode = true;
              this.loginForm.patchValue({ email });
              this.isLoading = false;
            }
          });
        },
        error: (error) => {
          this.error = error.error?.message || 'Registration failed. Please try again.';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.error = '';
    this.successMessage = '';
    this.loginForm.reset();
    this.registerForm.reset();
  }

  getFieldError(formName: 'login' | 'register', fieldName: string): string {
    const form = formName === 'login' ? this.loginForm : this.registerForm;
    const field = form.get(fieldName);

    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (fieldName === 'confirmPassword' && this.registerForm.errors?.['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }
}
