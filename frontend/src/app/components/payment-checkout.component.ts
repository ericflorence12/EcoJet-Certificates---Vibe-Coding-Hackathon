import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService, Payment, PaymentStatus } from '../services/payment.service';
import { OrderService, Order, OrderStatus } from '../services/order.service';

@Component({
  selector: 'app-payment-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="payment-container">
      <!-- Enhanced Header Section -->
      <div class="payment-header">
        <div class="header-background"></div>
        <div class="header-content">
          <div class="header-main">
            <div class="title-section">
              <div class="title-icon">💳</div>
              <div class="title-content">
                <h1 class="page-title">Secure Payment</h1>
                <p class="page-subtitle">Complete your SAF certificate purchase</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="payment-content">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-container">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading order details...</p>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="errorMessage && !order" class="error-container">
          <div class="error-card">
            <div class="error-icon">⚠️</div>
            <div class="error-content">
              <h3 class="error-title">Something went wrong</h3>
              <p class="error-message">{{ errorMessage }}</p>
              <button (click)="ngOnInit()" class="retry-btn">
                🔄 Try Again
              </button>
            </div>
          </div>
        </div>

        <!-- Payment Content -->
        <div *ngIf="order && !isLoading" class="payment-grid">
          <!-- Order Summary Card -->
          <div class="order-summary-card">
            <div class="card-header">
              <div class="card-icon">📋</div>
              <h2 class="card-title">Order Summary</h2>
            </div>
            <div class="card-content">
              <div class="order-details">
                <div class="detail-row">
                  <span class="detail-label">Flight Number</span>
                  <span class="detail-value flight-number">{{ order.flightNumber }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Route</span>
                  <span class="detail-value route">{{ order.departureAirport }} → {{ order.arrivalAirport }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Flight Date</span>
                  <span class="detail-value">{{ order.flightDate | date:'mediumDate' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">SAF Volume</span>
                  <span class="detail-value">{{ order.safVolume | number:'1.2-2' }} L</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">CO₂ Reduction</span>
                  <span class="detail-value carbon-reduction">{{ (order.flightEmissions * 0.8) | number:'1.2-2' }} kg</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Order Status</span>
                  <span class="detail-value">
                    <span class="status-badge" [ngClass]="getStatusBadgeClass(order.status)">
                      {{ order.status }}
                    </span>
                  </span>
                </div>
              </div>
              <div class="total-section">
                <div class="total-amount">
                  <span class="total-label">Total Amount</span>
                  <span class="total-value">{{ order.priceUsd | currency:'USD':'symbol':'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Section -->
          <div class="payment-section-card">
            <!-- Completed Status -->
            <div *ngIf="order.status === OrderStatus.COMPLETED || order.status === OrderStatus.PAID" class="completion-status">
              <div class="completion-header">
                <div class="completion-icon">✅</div>
                <div class="completion-content">
                  <h3 class="completion-title">
                    <span *ngIf="order.status === OrderStatus.PAID">Payment Completed!</span>
                    <span *ngIf="order.status === OrderStatus.COMPLETED">Order Completed!</span>
                  </h3>
                  <p class="completion-message">
                    <span *ngIf="order.status === OrderStatus.PAID">
                      Payment has been successfully processed! Your SAF certificate is being generated
                      and will be available for download shortly.
                    </span>
                    <span *ngIf="order.status === OrderStatus.COMPLETED">
                      This order has been successfully processed and payment has been completed.
                      Your SAF certificate is available for download.
                    </span>
                  </p>
                </div>
              </div>
              <div class="completion-actions">
                <button (click)="viewCertificates()" class="primary-btn completion-btn">
                  📜 View Certificate
                </button>
                <button (click)="viewOrders()" class="secondary-btn orders-btn">
                  📋 View Orders
                </button>
              </div>
            </div>

            <!-- Payment Processing -->
            <div *ngIf="order.status === OrderStatus.PENDING || order.status === OrderStatus.PROCESSING" class="payment-processing">
              <div class="payment-header-section">
                <div class="payment-icon">💳</div>
                <h3 class="payment-title">Payment Details</h3>
              </div>

              <div class="payment-form">
                <div class="payment-info">
                  <h4 class="payment-info-title">Payment Information</h4>
                  <p class="payment-info-text">
                    Click the button below to proceed with secure payment processing through Stripe.
                  </p>
                </div>

                <button (click)="processPayment()"
                        [disabled]="isProcessing"
                        class="payment-btn"
                        [ngClass]="{'processing': isProcessing}">
                  <div class="btn-content">
                    <div *ngIf="isProcessing" class="btn-spinner"></div>
                    <div class="btn-icon">
                      <svg *ngIf="!isProcessing" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span *ngIf="isProcessing">⏳</span>
                    </div>
                    <span class="btn-text">{{ isProcessing ? 'Processing Payment...' : 'Complete Secure Payment' }}</span>
                  </div>
                </button>

                <div class="payment-security">
                  <div class="security-info">
                    <div class="security-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                        <circle cx="12" cy="16" r="1" fill="currentColor"/>
                        <path d="M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </div>
                    <span class="security-text">256-bit SSL encryption • PCI DSS compliant</span>
                  </div>
                  <div class="payment-methods">
                    <!-- Visa -->
                    <div class="payment-method-card visa">
                      <svg width="40" height="24" viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="24" rx="4" fill="#1434CB"/>
                        <text x="20" y="16" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="white" text-anchor="middle">VISA</text>
                      </svg>
                    </div>

                    <!-- Mastercard -->
                    <div class="payment-method-card mastercard">
                      <svg width="40" height="24" viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="24" rx="4" fill="#EB001B"/>
                        <circle cx="15" cy="12" r="6" fill="#FF5F00"/>
                        <circle cx="25" cy="12" r="6" fill="#EB001B"/>
                        <circle cx="20" cy="12" r="6" fill="#FF5F00" opacity="0.7"/>
                      </svg>
                    </div>

                    <!-- American Express -->
                    <div class="payment-method-card amex">
                      <svg width="40" height="24" viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="24" rx="4" fill="#006FCF"/>
                        <text x="20" y="10" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="white" text-anchor="middle">AMERICAN</text>
                        <text x="20" y="17" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="white" text-anchor="middle">EXPRESS</text>
                      </svg>
                    </div>

                    <!-- Discover -->
                    <div class="payment-method-card discover">
                      <svg width="40" height="24" viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="24" rx="4" fill="#FF6000"/>
                        <text x="20" y="16" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="white" text-anchor="middle">DISCOVER</text>
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Trust Badges -->
                <div class="trust-section">
                  <div class="trust-badges">
                    <div class="trust-badge">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>SSL Secured</span>
                    </div>
                    <div class="trust-badge">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>PCI Compliant</span>
                    </div>
                    <div class="trust-badge">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C4.89 2 4 2.89 4 4V20C4 21.11 4.89 22 6 22H18C19.11 22 20 21.11 20 20V8L14 2Z" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M14 2V8H20" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 13H8" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 17H8" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10 9H8" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>Bank Level Security</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      position: relative;
      overflow-x: hidden;
    }

    .payment-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.08) 0%, transparent 50%);
      animation: paymentGlow 12s ease-in-out infinite;
    }

    @keyframes paymentGlow {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }

    /* Header Styles */
    .payment-header {
      position: relative;
      max-width: 1200px;
      margin: 2rem auto 3rem;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    }

    .header-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 120px;
      background: linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%);
      animation: headerShimmer 8s ease-in-out infinite;
    }

    @keyframes headerShimmer {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.1); }
    }

    .header-content {
      position: relative;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 2rem;
      margin-top: 80px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .header-main {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      text-align: center;
    }

    .title-icon {
      font-size: 3rem;
      filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.3));
      animation: iconFloat 3s ease-in-out infinite;
    }

    @keyframes iconFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .title-content {
      color: #1f2937;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0;
      background: linear-gradient(135deg, #059669, #047857);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-subtitle {
      margin: 0.5rem 0 0 0;
      font-size: 1.1rem;
      color: #6b7280;
      font-weight: 500;
    }

    /* Content Styles */
    .payment-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem 3rem;
      position: relative;
      z-index: 1;
    }

    .payment-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      animation: contentSlideIn 0.8s ease-out;
    }

    @keyframes contentSlideIn {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 1024px) {
      .payment-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }

    /* Card Styles */
    .order-summary-card,
    .payment-section-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(15px);
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .order-summary-card:hover,
    .payment-section-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    }

    .card-header {
      background: linear-gradient(135deg, #f8fafc, #e2e8f0);
      padding: 1.5rem;
      border-bottom: 1px solid rgba(226, 232, 240, 0.8);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .card-icon {
      font-size: 1.5rem;
      filter: drop-shadow(0 0 10px rgba(34, 197, 94, 0.3));
    }

    .card-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
    }

    .card-content {
      padding: 2rem;
    }

    /* Order Details */
    .order-details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: linear-gradient(135deg, #f8fafc, #f1f5f9);
      border-radius: 12px;
      border: 1px solid rgba(226, 232, 240, 0.6);
      transition: all 0.3s ease;
    }

    .detail-row:hover {
      background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
      transform: translateX(5px);
    }

    .detail-label {
      font-weight: 600;
      color: #4b5563;
      font-size: 0.9rem;
    }

    .detail-value {
      font-weight: 700;
      color: #1f2937;
      text-align: right;
    }

    .flight-number {
      color: #2563eb;
      font-family: 'Courier New', monospace;
    }

    .route {
      color: #7c3aed;
      font-weight: 800;
    }

    .carbon-reduction {
      color: #059669;
      font-weight: 800;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge.pending {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      color: #92400e;
      border: 1px solid #f59e0b;
    }

    .status-badge.processing {
      background: linear-gradient(135deg, #dbeafe, #bfdbfe);
      color: #1d4ed8;
      border: 1px solid #3b82f6;
    }

    .status-badge.paid {
      background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
      color: #1e3a8a;
      border: 1px solid #6366f1;
    }

    .status-badge.completed {
      background: linear-gradient(135deg, #d1fae5, #a7f3d0);
      color: #065f46;
      border: 1px solid #059669;
    }

    .status-badge.failed {
      background: linear-gradient(135deg, #fee2e2, #fecaca);
      color: #dc2626;
      border: 1px solid #ef4444;
    }

    /* Total Section */
    .total-section {
      padding: 1.5rem;
      background: linear-gradient(135deg, #059669, #047857);
      border-radius: 16px;
      color: white;
      text-align: center;
      box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3);
    }

    .total-amount {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .total-label {
      font-size: 1.2rem;
      font-weight: 600;
    }

    .total-value {
      font-size: 2rem;
      font-weight: 800;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    /* Completion Status */
    .completion-status {
      padding: 2rem;
    }

    .completion-header {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #d1fae5, #a7f3d0);
      border-radius: 16px;
      border: 1px solid #059669;
    }

    .completion-icon {
      font-size: 2.5rem;
      filter: drop-shadow(0 0 15px rgba(5, 150, 105, 0.4));
    }

    .completion-content h3 {
      margin: 0 0 1rem 0;
      color: #065f46;
      font-size: 1.5rem;
      font-weight: 800;
    }

    .completion-message {
      margin: 0;
      color: #047857;
      font-weight: 500;
      line-height: 1.6;
    }

    .completion-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    /* Payment Processing */
    .payment-processing {
      padding: 2rem;
    }

    .payment-header-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .payment-icon {
      font-size: 1.8rem;
      filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.3));
    }

    .payment-title {
      margin: 0;
      color: #1f2937;
      font-size: 1.4rem;
      font-weight: 700;
    }

    /* Payment Form */
    .payment-form {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .payment-info-title {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
      font-size: 1.1rem;
      font-weight: 700;
    }

    .payment-info-text {
      margin: 0;
      color: #6b7280;
      line-height: 1.6;
    }

    /* Payment Button */
    .payment-btn {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border: none;
      border-radius: 16px;
      padding: 1.5rem 2rem;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
      position: relative;
      overflow: hidden;
    }

    .payment-btn:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
    }

    .payment-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .payment-btn.processing {
      background: linear-gradient(135deg, #6b7280, #4b5563);
    }

    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.8rem;
    }

    .btn-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .btn-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .btn-icon svg {
      color: currentColor;
    }

    /* Security Section */
    .payment-security {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
    }

    .security-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .security-icon {
      color: #059669;
    }

    .security-text {
      font-size: 0.9rem;
      color: #6b7280;
      font-weight: 500;
    }

    .payment-methods {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .payment-method-card {
      border-radius: 6px;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .payment-method-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .payment-method-card svg {
      display: block;
    }

    /* Trust Section */
    .trust-section {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .trust-badges {
      display: flex;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .trust-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: #6b7280;
      font-weight: 500;
    }

    .trust-badge svg {
      flex-shrink: 0;
    }

    /* Button Styles */
    .primary-btn,
    .secondary-btn,
    .retry-btn {
      padding: 1rem 2rem;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
      font-size: 1rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .primary-btn {
      background: linear-gradient(135deg, #059669, #047857);
      color: white;
      box-shadow: 0 8px 20px rgba(5, 150, 105, 0.3);
    }

    .primary-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(5, 150, 105, 0.4);
    }

    .secondary-btn {
      background: linear-gradient(135deg, #f8fafc, #e2e8f0);
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .secondary-btn:hover {
      background: linear-gradient(135deg, #e2e8f0, #d1d5db);
      transform: translateY(-2px);
    }

    .retry-btn {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
    }

    .retry-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(245, 158, 11, 0.4);
    }

    /* Loading & Error States */
    .loading-container,
    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .loading-content,
    .error-card {
      text-align: center;
      padding: 3rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(15px);
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e5e7eb;
      border-top: 4px solid #059669;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    .loading-text,
    .error-message {
      margin: 0;
      color: #6b7280;
      font-weight: 500;
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .error-title {
      margin: 0 0 1rem 0;
      color: #dc2626;
      font-size: 1.5rem;
      font-weight: 700;
    }
  `]
})
export class PaymentCheckoutComponent implements OnInit {
  order: Order | null = null;
  isLoading = false;
  isProcessing = false;
  errorMessage = '';

  // Make OrderStatus available in template
  OrderStatus = OrderStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (orderId) {
      this.loadOrder(+orderId); // Convert to number
    } else {
      this.errorMessage = 'Order ID is required';
    }
  }

  loadOrder(orderId: number) {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getOrderById(orderId).subscribe({
      next: (order: Order) => {
        this.order = order;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading order:', error);
        this.errorMessage = 'Failed to load order details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case OrderStatus.COMPLETED:
        return 'completed';
      case OrderStatus.PAID:
        return 'paid';
      case OrderStatus.PENDING:
        return 'pending';
      case OrderStatus.PROCESSING:
        return 'processing';
      case OrderStatus.FAILED:
        return 'failed';
      default:
        return 'pending';
    }
  }

  processPayment() {
    if (!this.order) return;

    this.isProcessing = true;
    this.errorMessage = '';

    // Update order status to processing
    this.order.status = OrderStatus.PROCESSING;

    // Simulate payment processing
    setTimeout(() => {
      this.paymentService.completeOrderPayment(this.order!.id).subscribe({
        next: (updatedOrder: Order) => {
          this.isProcessing = false;
          this.order = updatedOrder; // Update with the order returned from backend
          // In real implementation, this would happen after successful Stripe payment
        },
        error: (error: any) => {
          console.error('Payment failed:', error);
          this.errorMessage = 'Payment processing failed. Please try again.';
          this.order!.status = OrderStatus.FAILED;
          this.isProcessing = false;
        }
      });
    }, 3000); // Simulate 3 second processing time
  }

  viewCertificates() {
    this.router.navigate(['/certificates']);
  }

  viewOrders() {
    this.router.navigate(['/orders']);
  }
}
