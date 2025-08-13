import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from './order.service';
import { API_BASE_URL } from '../config';

export interface Payment {
  id?: number;
  orderId: number;
  userId: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  paymentMethod?: string;
  feeAmount?: number;
  netAmount?: number;
  refundedAmount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  order?: Order;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

export interface PaymentAnalytics {
  totalRevenue: number;
  paymentMethodStats: { [key: string]: number };
  paymentSuccessRate: number;
  refundRate: number;
  monthlyRevenue: Array<{ month: string; amount: number }>;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
  publicKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = API_BASE_URL.replace(/\/api$/, ''); // ensure root base for payment endpoints

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Create Stripe checkout session for order payment
   */
  createCheckoutSession(orderId: number, successUrl?: string, cancelUrl?: string): Observable<any> {
    const payload = {
      orderId,
      successUrl: successUrl || `${window.location.origin}/payment/success`,
      cancelUrl: cancelUrl || `${window.location.origin}/payment/cancel`
    };

    return this.http.post<any>(`${this.baseUrl}/api/payments/checkout`, payload, {
      headers: this.getHeaders()
    });
  }

  /**
   * Handle successful payment confirmation
   */
  confirmPayment(sessionId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/payments/success`,
      { sessionId },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Complete payment for an order (demo/testing purposes)
   */
  completeOrderPayment(orderId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/orders/${orderId}/complete-payment`, {}, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get payment by ID
   */
  getPayment(paymentId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/payments/${paymentId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get payments for current user
   */
  getUserPayments(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/payments/user`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get payment by order ID
   */
  getPaymentByOrder(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/payments/order/${orderId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Request refund for payment (Admin only)
   */
  refundPayment(paymentId: number, amount?: number, reason?: string): Observable<any> {
    const payload = {
      amount,
      reason: reason || 'Customer request'
    };

    return this.http.post<any>(`${this.baseUrl}/api/payments/${paymentId}/refund`, payload, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get all payments (Admin only)
   */
  getAllPayments(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/payments?page=${page}&size=${size}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get payment analytics (Admin only)
   */
  getPaymentAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/analytics/payments`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get payment status display text
   */
  getStatusText(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.PENDING:
        return 'Pending';
      case PaymentStatus.PROCESSING:
        return 'Processing';
      case PaymentStatus.SUCCEEDED:
        return 'Completed';
      case PaymentStatus.FAILED:
        return 'Failed';
      case PaymentStatus.CANCELED:
        return 'Canceled';
      case PaymentStatus.REFUNDED:
        return 'Refunded';
      case PaymentStatus.PARTIALLY_REFUNDED:
        return 'Partially Refunded';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get payment status color class
   */
  getStatusColor(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.PENDING:
        return 'text-yellow-500';
      case PaymentStatus.PROCESSING:
        return 'text-blue-500';
      case PaymentStatus.SUCCEEDED:
        return 'text-green-500';
      case PaymentStatus.FAILED:
        return 'text-red-500';
      case PaymentStatus.CANCELED:
        return 'text-gray-500';
      case PaymentStatus.REFUNDED:
        return 'text-orange-500';
      case PaymentStatus.PARTIALLY_REFUNDED:
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  }

  /**
   * Format currency amount
   */
  formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Check if payment is successful
   */
  isPaymentSuccessful(status: PaymentStatus): boolean {
    return status === PaymentStatus.SUCCEEDED;
  }

  /**
   * Check if payment can be refunded
   */
  canRefund(status: PaymentStatus): boolean {
    return status === PaymentStatus.SUCCEEDED || status === PaymentStatus.PARTIALLY_REFUNDED;
  }

  /**
   * Calculate net amount after fees
   */
  calculateNetAmount(amount: number, feePercentage: number = 0.029): number {
    const feeAmount = amount * feePercentage + 0.30; // Stripe typical fees
    return amount - feeAmount;
  }
}
