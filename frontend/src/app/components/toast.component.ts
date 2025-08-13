import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorService, ErrorMessage } from '../services/error.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let error of errors"
        class="toast toast-{{error.type}}"
        [class.toast-enter]="true"
      >
        <div class="toast-content">
          <div class="toast-icon">
            <span *ngIf="error.type === 'error'">⚠️</span>
            <span *ngIf="error.type === 'warning'">⚡</span>
            <span *ngIf="error.type === 'info'">ℹ️</span>
            <span *ngIf="error.type === 'success'">✅</span>
          </div>
          <div class="toast-message">{{ error.message }}</div>
        </div>
        <button
          class="toast-close"
          (click)="removeError(error.id)"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
      border-left: 4px solid;
      position: relative;
      overflow: hidden;
    }

    .toast::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: inherit;
      opacity: 0.1;
      z-index: -1;
    }

    .toast-error {
      background: rgba(239, 68, 68, 0.95);
      border-left-color: #dc2626;
      color: white;
    }

    .toast-warning {
      background: rgba(245, 158, 11, 0.95);
      border-left-color: #d97706;
      color: white;
    }

    .toast-info {
      background: rgba(59, 130, 246, 0.95);
      border-left-color: #2563eb;
      color: white;
    }

    .toast-success {
      background: rgba(34, 197, 94, 0.95);
      border-left-color: #16a34a;
      color: white;
    }

    .toast-content {
      display: flex;
      align-items: flex-start;
      flex: 1;
      gap: 12px;
    }

    .toast-icon {
      font-size: 20px;
      line-height: 1;
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      font-size: 14px;
      line-height: 1.4;
      font-weight: 500;
    }

    .toast-close {
      background: none;
      border: none;
      color: inherit;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      margin-left: 12px;
      line-height: 1;
      opacity: 0.7;
      transition: opacity 0.2s ease;
      flex-shrink: 0;
    }

    .toast-close:hover {
      opacity: 1;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-enter {
      animation: slideIn 0.3s ease-out;
    }

    @media (max-width: 480px) {
      .toast-container {
        left: 20px;
        right: 20px;
        max-width: none;
      }

      .toast {
        margin-bottom: 8px;
        padding: 12px;
      }

      .toast-message {
        font-size: 13px;
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  errors: ErrorMessage[] = [];
  private subscription?: Subscription;

  constructor(private errorService: ErrorService) {}

  ngOnInit() {
    this.subscription = this.errorService.errors$.subscribe(errors => {
      this.errors = errors;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  removeError(id: string) {
    this.errorService.removeError(id);
  }
}
