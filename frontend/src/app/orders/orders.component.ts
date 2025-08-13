import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService, Order, PagedResponse } from '../services/order.service';
import { ErrorService } from '../services/error.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="orders-container">
      <!-- Enhanced Header Section -->
      <div class="orders-header">
        <div class="header-background"></div>
        <div class="header-content">
          <div class="header-main">
            <div class="title-section">
              <div class="title-icon">📋</div>
              <div class="title-content">
                <h1 class="page-title">Orders Management</h1>
                <p class="page-subtitle">View and manage your SAF certificate orders</p>
              </div>
            </div>
            <div class="header-actions">
              <button routerLink="/orders/create" class="btn btn-primary">
                <span class="btn-icon">➕</span>
                New Order
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Filters Section -->
      <div class="filters-section">
        <div class="filters-container">
          <div class="filters-grid">
            <!-- Search -->
            <div class="filter-group">
              <label class="filter-label">Search Orders</label>
              <div class="input-wrapper">
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  (ngModelChange)="onSearchChange()"
                  placeholder="Search by flight number..."
                  class="filter-input"
                />
                <div class="input-icon">🔍</div>
              </div>
            </div>

            <!-- Status Filter -->
            <div class="filter-group">
              <label class="filter-label">Status</label>
              <div class="select-wrapper">
                <select
                  [(ngModel)]="statusFilter"
                  (ngModelChange)="onFilterChange()"
                  class="filter-select"
                >
                  <option *ngFor="let status of statusOptions" [value]="status.value">
                    {{ status.label }}
                  </option>
                </select>
                <div class="select-arrow">▼</div>
              </div>
            </div>

            <!-- Sort By -->
            <div class="filter-group">
              <label class="filter-label">Sort By</label>
              <div class="sort-controls">
                <div class="select-wrapper">
                  <select
                    [(ngModel)]="sortBy"
                    (ngModelChange)="onSortChange()"
                    class="filter-select"
                  >
                    <option *ngFor="let sort of sortOptions" [value]="sort.value">
                      {{ sort.label }}
                    </option>
                  </select>
                  <div class="select-arrow">▼</div>
                </div>
                <button
                  (click)="toggleSortDirection()"
                  class="sort-direction-btn"
                  [class.desc]="sortDirection === 'desc'"
                >
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading your orders...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="error-container">
        <div class="error-card">
          <div class="error-icon">⚠️</div>
          <div class="error-content">
            <h3 class="error-title">Something went wrong</h3>
            <p class="error-message">{{ error }}</p>
            <button (click)="loadOrders()" class="retry-btn">
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>

      <!-- Orders Content -->
      <div *ngIf="!isLoading && !error" class="orders-content">
        <!-- Results Summary -->
        <div class="results-summary">
          <div class="summary-info">
            <span class="summary-text">
              Showing {{ orders.length > 0 ? ((currentPage * pageSize) + 1) : 0 }} -
              {{ Math.min((currentPage + 1) * pageSize, totalElements) }} of {{ totalElements }} orders
            </span>
          </div>
          <div class="view-controls">
            <div class="page-size-selector">
              <label>Show:</label>
              <select [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange()" class="page-size-select">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Orders List -->
        <div class="orders-list" *ngIf="orders.length > 0">
          <div class="order-card" *ngFor="let order of orders; trackBy: trackByOrderId">
            <div class="order-header">
              <div class="order-id">
                <span class="id-label">Order #{{ order.id }}</span>
                <div class="status-badge" [class]="'status-' + order.status.toLowerCase()">
                  {{ getStatusDisplay(order.status) }}
                </div>
              </div>
              <div class="order-date">{{ formatDate(order.createdAt) }}</div>
            </div>

            <div class="order-body">
              <div class="flight-info">
                <div class="flight-header">
                  <div class="flight-icon">✈️</div>
                  <div class="flight-details">
                    <div class="flight-number">{{ order.flightNumber }}</div>
                    <div class="flight-route">{{ order.departureAirport }} → {{ order.arrivalAirport }}</div>
                  </div>
                </div>
                <div class="flight-date">{{ formatFlightDate(order.flightDate) }}</div>
              </div>

              <div class="order-metrics">
                <div class="metric">
                  <div class="metric-label">SAF Volume</div>
                  <div class="metric-value">{{ order.safVolume | number:'1.2-2' }}L</div>
                </div>
                <div class="metric">
                  <div class="metric-label">CO₂ Offset</div>
                  <div class="metric-value">{{ (order.safVolume * 2.5) | number:'1.0-0' }}kg</div>
                </div>
                <div class="metric">
                  <div class="metric-label">Total Amount</div>
                  <div class="metric-value price">{{ formatCurrency(order.priceUsd) }}</div>
                </div>
              </div>
            </div>

            <div class="order-actions">
              <button
                routerLink="/orders/{{ order.id }}"
                class="action-btn view-btn"
                title="View Details"
              >
                👁️ View
              </button>
              <button
                *ngIf="order.status === 'PENDING'"
                (click)="payForOrder(order)"
                class="action-btn pay-btn"
                title="Pay for Order"
              >
                💳 Pay Now
              </button>
              <button
                *ngIf="order.status === 'PAID' || order.status === 'COMPLETED'"
                (click)="downloadCertificate(order.id)"
                class="action-btn download-btn"
                title="Download Certificate"
              >
                📄 Certificate
              </button>
              <button
                *ngIf="order.status === 'PENDING'"
                (click)="showCancelConfirmation(order.id)"
                class="action-btn cancel-btn"
                title="Cancel Order"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="orders.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3 class="empty-title">No Orders Found</h3>
          <p class="empty-description">
            <span *ngIf="searchTerm || statusFilter">No orders match your current filters.</span>
            <span *ngIf="!searchTerm && !statusFilter">You haven't placed any orders yet.</span>
          </p>
          <div class="empty-actions">
            <button *ngIf="searchTerm || statusFilter" (click)="clearFilters()" class="btn btn-secondary">
              Clear Filters
            </button>
            <button routerLink="/orders/create" class="btn btn-primary">
              Place Your First Order
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div *ngIf="totalPages > 1" class="pagination-container">
          <div class="pagination">
            <button
              class="pagination-btn"
              [disabled]="currentPage === 0"
              (click)="goToPage(0)"
              title="First Page"
            >
              ⏮️
            </button>
            <button
              class="pagination-btn"
              [disabled]="currentPage === 0"
              (click)="goToPage(currentPage - 1)"
              title="Previous Page"
            >
              ◀️
            </button>

            <div class="page-numbers">
              <button
                *ngFor="let page of getVisiblePages()"
                class="page-btn"
                [class.active]="page === currentPage"
                (click)="goToPage(page)"
              >
                {{ page + 1 }}
              </button>
            </div>

            <button
              class="pagination-btn"
              [disabled]="currentPage === totalPages - 1"
              (click)="goToPage(currentPage + 1)"
              title="Next Page"
            >
              ▶️
            </button>
            <button
              class="pagination-btn"
              [disabled]="currentPage === totalPages - 1"
              (click)="goToPage(totalPages - 1)"
              title="Last Page"
            >
              ⏭️
            </button>
          </div>

          <div class="pagination-info">
            Page {{ currentPage + 1 }} of {{ totalPages }}
          </div>
        </div>
      </div>

      <!-- Custom Confirmation Modal -->
      <div *ngIf="showConfirmationModal" class="modal-overlay" (click)="closeConfirmationModal()">
        <div class="confirmation-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-icon">⚠️</div>
            <h3 class="modal-title">Cancel Order</h3>
          </div>
          <div class="modal-body">
            <p class="modal-message">Are you sure you want to cancel this order?</p>
            <p class="modal-warning">This action cannot be undone.</p>
          </div>
          <div class="modal-actions">
            <button (click)="closeConfirmationModal()" class="modal-btn cancel-modal-btn">
              Cancel
            </button>
            <button (click)="confirmCancelOrder()" class="modal-btn confirm-modal-btn">
              Yes, Cancel Order
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      position: relative;
      overflow-x: hidden;
    }

    .orders-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
                  radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%);
      animation: ordersGlow 15s ease-in-out infinite;
    }

    @keyframes ordersGlow {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }

    /* Content Wrapper for Layout Consistency */
    .orders-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0;
      position: relative;
      z-index: 1;
    }

    /* Enhanced Header */
    .orders-header {
      position: relative;
      margin-bottom: 3rem;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
      max-width: 1400px;
      margin: 2rem auto 3rem;
    }

    .header-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 120px;
      background: linear-gradient(135deg,
        #8b5cf6 0%,
        #7c3aed 30%,
        #6d28d9 60%,
        #5b21b6 100%);
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
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 2rem;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .title-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      box-shadow: 0 15px 35px rgba(139, 92, 246, 0.4);
      margin-top: -30px;
      border: 3px solid white;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #1a202c, #2d3748);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0 0 0.5rem 0;
    }

    .page-subtitle {
      color: #64748b;
      font-size: 1rem;
      font-weight: 500;
      margin: 0;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary-green), var(--primary-green-dark));
      color: white;
      box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(34, 197, 94, 0.4);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
    }

    /* Enhanced Filters Section */
    .filters-section {
      max-width: 1400px;
      margin: 0 auto 2rem;
    }

    .filters-container {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .input-wrapper, .select-wrapper {
      position: relative;
    }

    .filter-input, .filter-select {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      background: white;
    }

    .filter-input:focus, .filter-select:focus {
      outline: none;
      border-color: #8b5cf6;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }

    .input-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
      pointer-events: none;
    }

    .select-arrow {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
      pointer-events: none;
      font-size: 0.8rem;
    }

    .sort-controls {
      display: flex;
      gap: 0.5rem;
      align-items: flex-end;
    }

    .sort-direction-btn {
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sort-direction-btn:hover {
      border-color: #8b5cf6;
      background: rgba(139, 92, 246, 0.05);
    }

    .sort-direction-btn.desc {
      background: #8b5cf6;
      color: white;
      border-color: #8b5cf6;
    }

    /* Loading & Error States */
    .loading-container, .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      margin: 2rem 1rem;
    }

    .loading-content {
      text-align: center;
      color: white;
    }

    .loading-spinner {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(255, 255, 255, 0.2);
      border-top: 4px solid #8b5cf6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-text {
      color: rgba(255, 255, 255, 0.8);
      font-size: 1.1rem;
      margin: 0;
    }

    .error-card {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      max-width: 400px;
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .error-title {
      color: #ef4444;
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }

    .error-message {
      color: rgba(255, 255, 255, 0.8);
      margin: 0 0 1.5rem 0;
    }

    .retry-btn {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .retry-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
    }

    /* Orders Content */
    .orders-content {
      max-width: 1400px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    .results-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1rem 1.5rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .summary-text {
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }

    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .page-size-select {
      padding: 0.5rem;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 0.875rem;
    }

    /* Order Cards */
    .orders-list {
      display: grid;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .order-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .order-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    }

    .order-header {
      padding: 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .order-id {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .id-label {
      font-weight: 700;
      color: #1a202c;
      font-size: 1.1rem;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-pending {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      color: #92400e;
      border: 2px solid #f59e0b;
    }

    .status-processing {
      background: linear-gradient(135deg, #dbeafe, #bfdbfe);
      color: #1e40af;
      border: 2px solid #3b82f6;
    }

    .status-paid {
      background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
      color: #1e3a8a;
      border: 2px solid #6366f1;
    }

    .status-completed {
      background: linear-gradient(135deg, #dcfce7, #bbf7d0);
      color: #166534;
      border: 2px solid #22c55e;
    }

    .status-cancelled {
      background: linear-gradient(135deg, #fee2e2, #fecaca);
      color: #991b1b;
      border: 2px solid #ef4444;
    }

    .order-date {
      color: #64748b;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .order-body {
      padding: 1.5rem;
    }

    .flight-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 12px;
    }

    .flight-header {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .flight-icon {
      font-size: 1.5rem;
    }

    .flight-number {
      font-weight: 700;
      color: #1a202c;
      font-size: 1.1rem;
    }

    .flight-route {
      color: #64748b;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .flight-date {
      color: #8b5cf6;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .order-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
    }

    .metric {
      text-align: center;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .metric-label {
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
    }

    .metric-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1a202c;
    }

    .metric-value.price {
      color: var(--primary-green);
    }

    .order-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid #f1f5f9;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .action-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .view-btn {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
    }

    .download-btn {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
    }

    .cancel-btn {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
    }

    .action-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 0.5rem 0;
    }

    .empty-description {
      color: #64748b;
      margin: 0 0 2rem 0;
      line-height: 1.5;
    }

    .empty-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* Pagination */
    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 2rem;
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .pagination {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .pagination-btn, .page-btn {
      padding: 0.5rem 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination-btn:not(:disabled):hover, .page-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .page-numbers {
      display: flex;
      gap: 0.25rem;
      margin: 0 1rem;
    }

    .page-btn.active {
      background: #8b5cf6;
      border-color: #8b5cf6;
      color: white;
    }

    .pagination-info {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
      font-weight: 500;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .orders-header {
        margin: 1rem 1rem 2rem;
      }

      .header-main {
        flex-direction: column;
        text-align: center;
      }

      .filters-section {
        margin: 0 1rem 1.5rem;
      }

      .filters-grid {
        grid-template-columns: 1fr;
      }

      .orders-content {
        padding: 0 1rem;
      }

      .results-summary {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .flight-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .order-metrics {
        grid-template-columns: repeat(2, 1fr);
      }

      .order-actions {
        justify-content: center;
      }

      .pagination-container {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .page-numbers {
        margin: 0;
      }
    }

    /* Custom Confirmation Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: modalFadeIn 0.3s ease-out;
    }

    @keyframes modalFadeIn {
      from {
        opacity: 0;
        backdrop-filter: blur(0px);
      }
      to {
        opacity: 1;
        backdrop-filter: blur(4px);
      }
    }

    .confirmation-modal {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.3);
      max-width: 450px;
      width: 90%;
      overflow: hidden;
      animation: modalSlideIn 0.3s ease-out;
    }

    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-30px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .modal-header {
      padding: 2rem 2rem 1rem;
      text-align: center;
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border-bottom: 1px solid rgba(245, 158, 11, 0.2);
    }

    .modal-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      filter: drop-shadow(0 4px 8px rgba(245, 158, 11, 0.3));
    }

    .modal-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #92400e;
    }

    .modal-body {
      padding: 1.5rem 2rem;
      text-align: center;
    }

    .modal-message {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #374151;
      line-height: 1.5;
    }

    .modal-warning {
      margin: 0;
      font-size: 0.9rem;
      color: #dc2626;
      font-weight: 500;
    }

    .modal-actions {
      padding: 1rem 2rem 2rem;
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .modal-btn {
      padding: 0.875rem 1.5rem;
      border: none;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 120px;
    }

    .cancel-modal-btn {
      background: linear-gradient(135deg, #f8fafc, #e2e8f0);
      color: #374151;
      border: 2px solid #d1d5db;
    }

    .cancel-modal-btn:hover {
      background: linear-gradient(135deg, #e2e8f0, #d1d5db);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .confirm-modal-btn {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      color: white;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
    }

    .confirm-modal-btn:hover {
      background: linear-gradient(135deg, #b91c1c, #991b1b);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4);
    }

    /* CSS Variables */
    :root {
      --primary-green: #22c55e;
      --primary-green-dark: #16a34a;
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  error = '';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // Filtering
  statusFilter = '';
  searchTerm = '';
  sortBy = 'createdAt';
  sortDirection = 'desc';

  statusOptions = [
    { value: '', label: 'All Orders' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'PAID', label: 'Paid' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'flightDate', label: 'Flight Date' },
    { value: 'priceUsd', label: 'Amount' },
    { value: 'status', label: 'Status' }
  ];

  // Modal state
  showConfirmationModal = false;
  orderToCancel: number | null = null;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private errorService: ErrorService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;

    const filters: any = {};
    if (this.statusFilter) filters.status = this.statusFilter;
    if (this.searchTerm) filters.flightNumber = this.searchTerm;

    this.orderService.getOrders(
      this.currentPage,
      this.pageSize,
      this.sortBy,
      this.sortDirection,
      filters
    ).subscribe({
      next: (response: PagedResponse<Order>) => {
        this.orders = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.error = 'Failed to load orders';
        this.errorService.showApiError(error);
        this.isLoading = false;
      }
    });
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadOrders();
  }

  onSortChange() {
    this.currentPage = 0;
    this.loadOrders();
  }

  onSearchChange() {
    this.currentPage = 0;
    this.loadOrders();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadOrders();
  }

  onSortDirectionToggle() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.onSortChange();
  }

  getStatusBadgeClass(status: string): string {
    return this.orderService.getStatusBadgeClass(status);
  }

  getStatusDisplayText(status: string): string {
    return this.orderService.getStatusDisplayText(status);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  generatePageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(5, this.totalPages);
    const startPage = Math.max(0, this.currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(this.totalPages - 1, startPage + maxPages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  downloadCertificate(orderId: number) {
    this.orderService.downloadCertificate(orderId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${orderId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        console.error('Failed to download certificate:', error);
      }
    });
  }

  // Additional methods for the new template
  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.onSortChange();
  }

  getStatusDisplay(status: string): string {
    return this.getStatusDisplayText(status);
  }

  formatFlightDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  trackByOrderId(index: number, order: Order): any {
    return order.id;
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.loadOrders();
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadOrders();
  }

  getVisiblePages(): number[] {
    return this.generatePageNumbers();
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.currentPage = 0;
    this.loadOrders();
  }

  payForOrder(order: Order) {
    if (!order.id) {
      this.errorService.showError('Invalid order ID');
      return;
    }

    // Navigate to payment checkout page
    this.router.navigate(['/payment/checkout', order.id]);
  }

  showCancelConfirmation(orderId: number) {
    this.orderToCancel = orderId;
    this.showConfirmationModal = true;
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
    this.orderToCancel = null;
  }

  confirmCancelOrder() {
    if (this.orderToCancel) {
      this.orderService.cancelOrder(this.orderToCancel).subscribe({
        next: () => {
          this.loadOrders(); // Refresh the list
          this.closeConfirmationModal();
        },
        error: (error: any) => {
          this.errorService.showApiError(error);
          this.closeConfirmationModal();
        }
      });
    }
  }

  // Expose Math to template
  Math = Math;
}
