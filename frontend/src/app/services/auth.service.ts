import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { API_BASE_URL } from '../config';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  createdAt: string;
  totalOrders?: number;
  totalEmissionsReduced?: number;
  memberSince?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company: string;
  role?: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = API_BASE_URL;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load user and token from localStorage on service initialization
    const token = localStorage.getItem('saf_token');
    const user = localStorage.getItem('saf_user');

    if (token && token !== 'undefined' && token !== 'null') {
      this.tokenSubject.next(token);
    } else if (token === 'undefined' || token === 'null') {
      localStorage.removeItem('saf_token');
    }

    if (user && user !== 'undefined' && user !== 'null') {
      try {
        this.currentUserSubject.next(JSON.parse(user));
      } catch (error) {
        console.warn('Failed to parse user data from localStorage:', error);
        localStorage.removeItem('saf_user');
        localStorage.removeItem('saf_token'); // Also clear token if user data is corrupted
      }
    } else if (user === 'undefined' || user === 'null') {
      localStorage.removeItem('saf_user');
    }
  }

  register(registerData: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/auth/register`, registerData);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          // Convert the backend response to a User object
          const user: User = {
            id: 0, // Backend doesn't provide ID in login response
            email: response.email,
            firstName: response.fullName.split(' ')[0] || '',
            lastName: response.fullName.split(' ').slice(1).join(' ') || '',
            company: '', // Backend doesn't provide company in login response
            role: response.role,
            createdAt: new Date().toISOString()
          };

          localStorage.setItem('saf_token', response.token);
          localStorage.setItem('saf_user', JSON.stringify(user));
          this.tokenSubject.next(response.token);
          this.currentUserSubject.next(user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('saf_token');
    localStorage.removeItem('saf_user');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem('saf_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  clearAuthData(): void {
    // Clear any potentially corrupted auth data
    localStorage.removeItem('saf_token');
    localStorage.removeItem('saf_user');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/profile`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(user => {
        localStorage.setItem('saf_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  updateProfile(profileData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/users/profile`, profileData, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(user => {
        localStorage.setItem('saf_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }
}
