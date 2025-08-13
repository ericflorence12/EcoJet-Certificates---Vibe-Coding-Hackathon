import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { ErrorService } from '../services/error.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="profile-container">
      <div class="profile-content">
        <!-- Animated Header -->
        <div class="profile-header">
          <div class="header-background"></div>
          <div class="header-content">
            <div class="profile-avatar-section">
              <div class="avatar-container">
                <div class="avatar-large">
                  {{ (user.firstName || user.email || 'U').charAt(0).toUpperCase() }}
                </div>
                <div class="avatar-status"></div>
              </div>
              <div class="profile-info">
                <h1 class="profile-name">{{ user.firstName }} {{ user.lastName || 'User' }}</h1>
                <p class="profile-email">{{ user.email }}</p>
                <div class="role-container">
                  <span class="role-badge" [class.admin]="user.role === 'ADMIN'">
                    <i class="role-icon" [class]="user.role === 'ADMIN' ? 'admin-icon' : 'user-icon'"></i>
                    {{ user.role === 'ADMIN' ? 'Administrator' : 'Member' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="member-since">
              <div class="member-label">Member since</div>
              <div class="member-date">{{ formatDate(user.createdAt) }}</div>
            </div>
          </div>
        </div>

        <!-- Enhanced Profile Form -->
        <div class="profile-form-card">
          <div class="card-header">
            <h2 class="card-title">
              📋 Personal Information
            </h2>
            <p class="card-subtitle">Update your account details and preferences</p>
          </div>

          <form (ngSubmit)="onSubmit()" #profileForm="ngForm" class="form-content">
            <div class="form-grid">
              <div class="form-group">
                <label for="firstName" class="form-label">
                  First Name
                </label>
                <div class="input-wrapper">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    [(ngModel)]="user.firstName"
                    required
                    class="form-input"
                    placeholder="Enter your first name"
                  >
                  <div class="input-highlight"></div>
                </div>
              </div>

              <div class="form-group">
                <label for="lastName" class="form-label">
                  Last Name
                </label>
                <div class="input-wrapper">
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    [(ngModel)]="user.lastName"
                    required
                    class="form-input"
                    placeholder="Enter your last name"
                  >
                  <div class="input-highlight"></div>
                </div>
              </div>

              <div class="form-group">
                <label for="email" class="form-label">
                  Email Address
                </label>
                <div class="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    [(ngModel)]="user.email"
                    required
                    class="form-input"
                    placeholder="Enter your email"
                  >
                  <div class="input-highlight"></div>
                </div>
              </div>

              <div class="form-group">
                <label for="company" class="form-label">
                  Company
                </label>
                <div class="input-wrapper">
                  <input
                    type="text"
                    id="company"
                    name="company"
                    [(ngModel)]="user.company"
                    class="form-input"
                    placeholder="Enter your company name"
                  >
                  <div class="input-highlight"></div>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button
                type="button"
                routerLink="/dashboard"
                class="btn btn-secondary"
              >
                ← Back to Dashboard
              </button>
              <button
                type="submit"
                [disabled]="!profileForm.form.valid || saving"
                class="btn btn-primary"
                [class.loading]="saving"
              >
                {{ saving ? '⏳ Saving Changes...' : '💾 Save Changes' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Enhanced Account Actions -->
        <div class="account-actions-card">
          <div class="card-header">
            <h2 class="card-title">
              ⚙️ Account Settings
            </h2>
            <p class="card-subtitle">Manage your account security and preferences</p>
          </div>

          <div class="actions-grid">
            <div class="action-item password-action">
              <div class="action-icon-wrapper">
                🔑
              </div>
              <div class="action-content">
                <h3 class="action-title">Change Password</h3>
                <p class="action-description">Update your account password for better security</p>
              </div>
              <button class="btn btn-outline" (click)="changePassword()">
                ✏️ Change
              </button>
            </div>

            <div class="action-item delete-action">
              <div class="action-icon-wrapper danger">
                🗑️
              </div>
              <div class="action-content">
                <h3 class="action-title danger">Delete Account</h3>
                <p class="action-description danger">Permanently remove your account and all associated data</p>
              </div>
              <button class="btn btn-danger" (click)="deleteAccount()">
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%);
      padding: 2rem 1rem;
      position: relative;
      overflow-x: hidden;
    }

    .profile-container::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
                  radial-gradient(circle at 70% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 50%);
      z-index: 0;
      animation: backgroundFloat 20s ease-in-out infinite;
    }

    @keyframes backgroundFloat {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      33% { transform: translate(-20px, -20px) rotate(1deg); }
      66% { transform: translate(20px, -10px) rotate(-1deg); }
    }

    .profile-content {
      max-width: 1000px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
      animation: slideUp 0.8s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Enhanced Header Section */
    .profile-header {
      position: relative;
      margin-bottom: 2rem;
      overflow: hidden;
      border-radius: 20px;
      box-shadow:
        0 20px 40px rgba(0, 0, 0, 0.3),
        0 8px 24px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .header-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 140px;
      background: linear-gradient(135deg,
        #059669 0%,
        #047857 50%,
        #065f46 100%);
      opacity: 0.9;
    }

    .header-background::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    }

    .header-content {
      position: relative;
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
      backdrop-filter: blur(20px);
      padding: 2rem;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-top: 100px;
      flex-wrap: wrap;
      gap: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .profile-avatar-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex: 1;
      min-width: 300px;
    }

    .avatar-container {
      position: relative;
      margin-top: -50px;
    }

    .avatar-large {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, #059669, #047857);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: white;
      font-size: 2.5rem;
      border: 6px solid rgba(255, 255, 255, 0.9);
      box-shadow:
        0 15px 35px rgba(0, 0, 0, 0.25),
        0 8px 20px rgba(0, 0, 0, 0.15),
        inset 0 2px 0 rgba(255, 255, 255, 0.3);
      position: relative;
      animation: avatarPulse 3s ease-in-out infinite;
    }

    @keyframes avatarPulse {
      0%, 100% {
        box-shadow:
          0 15px 35px rgba(0, 0, 0, 0.25),
          0 8px 20px rgba(0, 0, 0, 0.15),
          inset 0 2px 0 rgba(255, 255, 255, 0.3),
          0 0 0 0 rgba(5, 150, 105, 0.4);
      }
      50% {
        box-shadow:
          0 20px 40px rgba(0, 0, 0, 0.3),
          0 12px 24px rgba(0, 0, 0, 0.2),
          inset 0 2px 0 rgba(255, 255, 255, 0.4),
          0 0 0 10px rgba(5, 150, 105, 0);
      }
    }

    .avatar-status {
      position: absolute;
      bottom: 8px;
      right: 8px;
      width: 20px;
      height: 20px;
      background: #10b981;
      border: 3px solid white;
      border-radius: 50%;
      animation: statusBlink 2s ease-in-out infinite;
    }

    @keyframes statusBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    .profile-info h1.profile-name {
      font-size: 2rem;
      font-weight: 700;
      color: #1a202c;
      margin: 0 0 0.5rem 0;
      line-height: 1.2;
    }

    .profile-email {
      color: #64748b;
      font-size: 1rem;
      margin: 0 0 1rem 0;
      font-weight: 500;
    }

    .role-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-size: 0.875rem;
      font-weight: 600;
      background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
      color: #475569;
      border: 2px solid #e2e8f0;
      transition: all 0.3s ease;
    }

    .role-badge.admin {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.25));
      color: var(--primary-green-dark);
      border-color: rgba(34, 197, 94, 0.3);
      animation: adminGlow 3s ease-in-out infinite;
    }

    @keyframes adminGlow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
      50% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0.1); }
    }

    .member-since {
      text-align: right;
      color: #64748b;
      font-size: 0.875rem;
    }

    .member-label {
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    .member-date {
      font-weight: 700;
      color: #374151;
    }

    /* Enhanced Form Card */
    .profile-form-card, .account-actions-card {
      background: linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
      backdrop-filter: blur(20px);
      border-radius: 20px;
      box-shadow:
        0 20px 40px rgba(0, 0, 0, 0.3),
        0 8px 24px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      margin-bottom: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .profile-form-card:hover, .account-actions-card:hover {
      transform: translateY(-4px);
      box-shadow:
        0 25px 50px rgba(0, 0, 0, 0.4),
        0 12px 30px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .card-header {
      padding: 2rem 2rem 1rem 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1));
      position: relative;
    }

    .card-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg,
        rgba(59, 130, 246, 0.05) 0%,
        rgba(16, 185, 129, 0.05) 50%,
        rgba(139, 92, 246, 0.05) 100%);
      pointer-events: none;
    }

    .card-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      position: relative;
      z-index: 1;
    }

    .card-subtitle {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.95rem;
      margin: 0;
      line-height: 1.5;
      position: relative;
      z-index: 1;
    }

    .form-content {
      padding: 2rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .form-group {
      position: relative;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .input-wrapper {
      position: relative;
    }

    .form-input {
      width: 100%;
      padding: 1rem 1.25rem;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: rgba(255, 255, 255, 0.05);
      color: #ffffff;
      font-weight: 500;
      backdrop-filter: blur(10px);
    }

    .form-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .form-input:focus {
      outline: none;
      border-color: rgba(59, 130, 246, 0.5);
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
      box-shadow:
        0 8px 25px rgba(59, 130, 246, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .input-highlight {
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 3px;
      background: linear-gradient(90deg, #3b82f6, #10b981);
      transition: all 0.3s ease;
      border-radius: 2px;
      transform: translateX(-50%);
    }

    .form-input:focus + .input-highlight {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 2rem;
      border-top: 1px solid #f1f5f9;
      gap: 1rem;
      flex-wrap: wrap;
    }

    /* Enhanced Buttons */
    .btn {
      padding: 0.875rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      position: relative;
      overflow: hidden;
      min-width: 140px;
    }

    .btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .btn:hover::before {
      left: 100%;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      box-shadow:
        0 4px 15px rgba(59, 130, 246, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow:
        0 8px 25px rgba(59, 130, 246, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .btn-secondary {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
      color: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
    }

    .btn-secondary:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1));
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-primary.loading {
      animation: buttonPulse 1.5s ease-in-out infinite;
    }

    @keyframes buttonPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }

    .btn-outline {
      background: transparent;
      color: rgba(255, 255, 255, 0.9);
      border: 2px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
    }

    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .btn-danger {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      box-shadow:
        0 4px 15px rgba(239, 68, 68, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .btn-danger:hover {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      transform: translateY(-2px);
      box-shadow:
        0 8px 25px rgba(239, 68, 68, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }

    /* Enhanced Account Actions */
    .actions-grid {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .action-item {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.5rem;
      border-radius: 16px;
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .action-item:hover {
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.08));
      transform: translateX(8px);
      box-shadow:
        0 8px 25px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .action-icon-wrapper {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.2));
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(59, 130, 246, 0.3);
      flex-shrink: 0;
      font-size: 1.5rem;
    }

    .action-icon-wrapper.danger {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
      border-color: rgba(239, 68, 68, 0.4);
    }

    .action-content {
      flex: 1;
    }

    .action-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.95);
      margin: 0 0 0.5rem 0;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .action-title.danger {
      color: #f87171;
    }

    .action-description {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
      margin: 0;
      line-height: 1.5;
    }

    .action-description.danger {
      color: rgba(248, 113, 113, 0.9);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .profile-container {
        padding: 1rem 0.5rem;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .profile-avatar-section {
        flex-direction: column;
        text-align: center;
        min-width: auto;
      }

      .member-since {
        text-align: center;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column-reverse;
        align-items: stretch;
      }

      .action-item {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .btn {
        min-width: auto;
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .profile-name {
        font-size: 1.5rem !important;
      }

      .card-header {
        padding: 1.5rem 1.5rem 1rem 1.5rem;
      }

      .form-content, .actions-grid {
        padding: 1.5rem;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: User = {
    id: 0,
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    role: 'USER',
    createdAt: ''
  };
  saving = false;

  constructor(
    private authService: AuthService,
    private errorService: ErrorService
  ) {}

  ngOnInit() {
    // Load current user data
    this.authService.currentUser$.subscribe(currentUser => {
      if (currentUser) {
        this.user = { ...currentUser };
      }
    });
  }

  onSubmit() {
    if (!this.user) return;

    this.saving = true;

    // TODO: Implement user update API call
    setTimeout(() => {
      this.saving = false;
      // Update the current user in auth service
      this.authService.updateCurrentUser(this.user);
      this.errorService.showSuccess('Profile updated successfully!');
    }, 1000);
  }

  changePassword() {
    // TODO: Implement change password functionality
    this.errorService.showInfo('Change password functionality coming soon!');
  }

  deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Implement account deletion
      this.errorService.showInfo('Account deletion functionality coming soon!');
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
