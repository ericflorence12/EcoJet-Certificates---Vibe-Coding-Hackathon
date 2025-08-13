import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, User } from './services/auth.service';
import { ToastComponent } from './components/toast.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'EcoJet Certificates';
  currentUser$: Observable<User | null>;
  currentUser: User | null = null;
  isAuthenticated = false;
  isUserDropdownOpen = false;
  currentYear = new Date().getFullYear();

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });
  }

  toggleUserDropdown(event: Event) {
    event.stopPropagation();
    this.isUserDropdownOpen = !this.isUserDropdownOpen;

    // Add click listener to close dropdown when clicking outside
    if (this.isUserDropdownOpen) {
      // Remove any existing listener first
      document.removeEventListener('click', this.handleOutsideClick);
      // Add listener after a short delay to avoid immediate closing
      setTimeout(() => {
        document.addEventListener('click', this.handleOutsideClick);
      }, 10);
    } else {
      document.removeEventListener('click', this.handleOutsideClick);
    }
  }

  private handleOutsideClick = (event: Event) => {
    const target = event.target as Element;
    if (!target.closest('.user-dropdown')) {
      this.isUserDropdownOpen = false;
      document.removeEventListener('click', this.handleOutsideClick);
    }
  }

  private hoverTimeoutId: any = null;

  onDropdownMouseLeave() {
    // Clear any existing timeout
    if (this.hoverTimeoutId) {
      clearTimeout(this.hoverTimeoutId);
    }

    // Add a longer delay to give user time to move cursor to dropdown menu
    this.hoverTimeoutId = setTimeout(() => {
      this.isUserDropdownOpen = false;
      document.removeEventListener('click', this.handleOutsideClick);
    }, 300);
  }

  onDropdownMouseEnter() {
    // Clear any pending close timeout
    if (this.hoverTimeoutId) {
      clearTimeout(this.hoverTimeoutId);
      this.hoverTimeoutId = null;
    }

    // Keep dropdown open when hovering
    this.isUserDropdownOpen = true;

    // Add click listener if not already added
    if (!document.body.contains(document.querySelector('.dropdown-click-listener'))) {
      setTimeout(() => {
        document.addEventListener('click', this.handleOutsideClick);
      }, 10);
    }
  }

  closeUserDropdown() {
    // Clear any pending timeout
    if (this.hoverTimeoutId) {
      clearTimeout(this.hoverTimeoutId);
      this.hoverTimeoutId = null;
    }

    this.isUserDropdownOpen = false;
    document.removeEventListener('click', this.handleOutsideClick);
  }

  logout() {
    // Clear any pending timeouts before logout
    if (this.hoverTimeoutId) {
      clearTimeout(this.hoverTimeoutId);
      this.hoverTimeoutId = null;
    }

    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    // Clean up event listeners and timeouts
    if (this.hoverTimeoutId) {
      clearTimeout(this.hoverTimeoutId);
    }
    document.removeEventListener('click', this.handleOutsideClick);
  }
}
