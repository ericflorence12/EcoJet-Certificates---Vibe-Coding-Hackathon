import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { API_BASE_URL } from '../config';

export interface Order {
  id: number;
  userEmail: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  flightDate: string;
  flightEmissions: number;
  safVolume: number;
  safVolumeLiters?: number; // Computed property
  co2ReductionKg?: number; // Computed property
  priceUsd: number;
  platformFeeUsd?: number;
  status: OrderStatus;
  certificateNumber?: string;
  registryId?: string;
  pdfUrl?: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
  certificate?: Certificate;
}

export interface OrderRequest {
  userEmail: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  flightDate: string;
  flightEmissions: number;
  safVolume: number;
  priceUsd: number;
}

export interface Certificate {
  id: number;
  certNumber: string;
  issueDate: string;
  pdfUri: string;
  registryId: string;
  order: {
    id: number;
    userEmail: string;
    flightNumber: string;
    departureAirport: string;
    arrivalAirport: string;
    flightDate: string;
    flightEmissions: number;
    safVolume: number;
    priceUsd: number;
    platformFeeUsd: number;
    status: string;
    createdAt: string;
    completedAt?: string;
  };
}

export interface Quote {
  flightEmissions: number;
  recommendedSafVolume: number;
  pricePerLiter: number;
  totalPrice: number;
  carbonReduction: number;
  validUntil: string;
  priceBreakdown: {
    baseCost: number;
    carbonCredit: number;
    processingFee: number;
    regulatoryFee: number;
  };
}

export interface QuoteRequest {
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  flightDate: string;
  estimatedEmissions: number;
}

export interface OrderStatistics {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalSafVolume: number;
  totalRevenue: number;
}

export interface AdminStatistics {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalSafVolume: number;
  totalRevenue: number;
}

export interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_URL = API_BASE_URL;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  createOrder(orderRequest: OrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.API_URL}/orders`, orderRequest, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getOrders(
    page: number = 0,
    size: number = 10,
    sort: string = 'createdAt',
    direction: string = 'desc',
    filters?: {
      userEmail?: string;
      status?: string;
      flightNumber?: string;
      fromDate?: string;
      toDate?: string;
    }
  ): Observable<PagedResponse<Order>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort)
      .set('direction', direction);

    if (filters) {
      if (filters.userEmail) params = params.set('userEmail', filters.userEmail);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.flightNumber) params = params.set('flightNumber', filters.flightNumber);
      if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
      if (filters.toDate) params = params.set('toDate', filters.toDate);
    }

    return this.http.get<PagedResponse<Order>>(`${this.API_URL}/orders`, {
      headers: this.authService.getAuthHeaders(),
      params
    });
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.API_URL}/orders/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getOrderStatistics(): Observable<OrderStatistics> {
    return this.http.get<OrderStatistics>(`${this.API_URL}/orders/stats`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getAdminStatistics(): Observable<AdminStatistics> {
    return this.http.get<AdminStatistics>(`${this.API_URL}/admin/stats`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getQuote(quoteRequest: QuoteRequest): Observable<Quote> {
    return this.http.post<Quote>(`${this.API_URL}/quote`, quoteRequest);
  }

  getFlightEmissions(flightNumber: string, departureAirport: string, arrivalAirport: string): Observable<any> {
    const params = new HttpParams()
      .set('departureAirport', departureAirport)
      .set('arrivalAirport', arrivalAirport);

    return this.http.get<any>(`${this.API_URL}/orders/emissions/${flightNumber}`, { params });
  }

  getCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.API_URL}/certificates`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getCertificate(id: number): Observable<Certificate> {
    return this.http.get<Certificate>(`${this.API_URL}/certificates/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  downloadCertificate(orderId: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/certificates/order/${orderId}/download`, {
      headers: this.authService.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  cancelOrder(id: number): Observable<Order> {
    return this.http.put<Order>(`${this.API_URL}/orders/${id}/cancel`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Helper methods for UI
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case OrderStatus.COMPLETED:
        return 'badge-success';
      case OrderStatus.PAID:
        return 'badge-info';
      case OrderStatus.PENDING:
      case OrderStatus.PROCESSING:
        return 'badge-warning';
      case OrderStatus.FAILED:
      case OrderStatus.CANCELLED:
        return 'badge-error';
      default:
        return 'badge-primary';
    }
  }

  getStatusDisplayText(status: string): string {
    switch (status) {
      case OrderStatus.COMPLETED:
        return 'Completed';
      case OrderStatus.PAID:
        return 'Paid';
      case OrderStatus.PENDING:
        return 'Pending';
      case OrderStatus.PROCESSING:
        return 'Processing';
      case OrderStatus.FAILED:
        return 'Failed';
      case OrderStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatNumber(value: number, decimals: number = 2): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }

  formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  }
}
