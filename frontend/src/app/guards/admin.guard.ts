import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      const currentUser = this.authService.getCurrentUser();

      // Check if user has admin role
      if (currentUser?.role === 'ADMIN') {
        return true;
      } else {
        // User is authenticated but not admin - redirect to dashboard
        this.router.navigate(['/dashboard']);
        return false;
      }
    } else {
      // User is not authenticated - redirect to login
      this.router.navigate(['/login']);
      return false;
    }
  }
}
