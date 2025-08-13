import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ErrorMessage {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: Date;
  autoClose?: boolean;
  duration?: number; // in milliseconds
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorSubject = new BehaviorSubject<ErrorMessage[]>([]);
  public errors$ = this.errorSubject.asObservable();

  constructor() {}

  showError(message: string, autoClose = true, duration = 5000) {
    this.addError({
      id: this.generateId(),
      message,
      type: 'error',
      timestamp: new Date(),
      autoClose,
      duration
    });
  }

  showWarning(message: string, autoClose = true, duration = 4000) {
    this.addError({
      id: this.generateId(),
      message,
      type: 'warning',
      timestamp: new Date(),
      autoClose,
      duration
    });
  }

  showInfo(message: string, autoClose = true, duration = 3000) {
    this.addError({
      id: this.generateId(),
      message,
      type: 'info',
      timestamp: new Date(),
      autoClose,
      duration
    });
  }

  showSuccess(message: string, autoClose = true, duration = 3000) {
    this.addError({
      id: this.generateId(),
      message,
      type: 'success',
      timestamp: new Date(),
      autoClose,
      duration
    });
  }

  showApiError(error: any) {
    let message = 'An unexpected error occurred. Please try again.';

    if (error?.error?.message) {
      message = error.error.message;
    } else if (error?.message) {
      message = error.message;
    } else if (error?.status) {
      switch (error.status) {
        case 400:
          message = 'Bad request. Please check your input and try again.';
          break;
        case 401:
          message = 'You are not authorized. Please sign in and try again.';
          break;
        case 403:
          message = 'Access denied. You do not have permission to perform this action.';
          break;
        case 404:
          message = 'The requested resource was not found.';
          break;
        case 500:
          message = 'Server error. Please try again later.';
          break;
        case 503:
          message = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          message = `Error ${error.status}: ${error.statusText || 'Unknown error'}`;
      }
    }

    this.showError(message);
  }

  private addError(error: ErrorMessage) {
    const currentErrors = this.errorSubject.value;
    this.errorSubject.next([...currentErrors, error]);

    if (error.autoClose) {
      setTimeout(() => {
        this.removeError(error.id);
      }, error.duration);
    }
  }

  removeError(id: string) {
    const currentErrors = this.errorSubject.value;
    const filteredErrors = currentErrors.filter(error => error.id !== id);
    this.errorSubject.next(filteredErrors);
  }

  clearAllErrors() {
    this.errorSubject.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
