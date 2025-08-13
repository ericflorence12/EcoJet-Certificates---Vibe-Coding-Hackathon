import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { OrderService, OrderStatistics, Order, PagedResponse } from '../services/order.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="user-dashboard-container">
      <div class="dashboard-content">
        <!-- Enhanced Welcome Header -->
        <div class="dashboard-header">
          <div class="header-background"></div>
          <div class="header-content">
            <div class="header-main">
              <div class="welcome-badge-container">
                <div class="user-avatar">
                  {{ currentUser?.firstName?.charAt(0) || 'U' }}
                </div>
                <div class="welcome-info">
                  <h1 class="welcome-title">{{ getGreeting() }}, {{ currentUser?.firstName || 'User' }}!</h1>
                  <p class="welcome-subtitle">Your sustainable aviation fuel certificate platform</p>
                </div>
              </div>
              <div class="header-actions">
                <button routerLink="/orders/create" class="action-btn primary">
                  ➕ New Order
                </button>
                <button routerLink="/orders" class="action-btn secondary">
                  📋 View Orders
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-container">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading your dashboard...</p>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !isLoading" class="error-container">
          <div class="error-card">
            <div class="error-icon">⚠️</div>
            <div class="error-content">
              <h3 class="error-title">Something went wrong</h3>
              <p class="error-message">{{ error }}</p>
              <button (click)="loadStatistics()" class="retry-btn">
                🔄 Try Again
              </button>
            </div>
          </div>
        </div>

        <!-- Enhanced Stats Grid -->
        <div *ngIf="!isLoading && !error && statistics" class="stats-grid">
          <div class="stat-card orders-card">
            <div class="stat-icon-wrapper">
              <div class="stat-icon orders-icon"></div>
              <div class="stat-badge">{{ getCompletionRate() | number:'1.0-0' }}%</div>
            </div>
            <div class="stat-content">
              <div class="stat-title">Total Orders</div>
              <div class="stat-value">{{ statistics.totalOrders }}</div>
              <div class="stat-detail">{{ statistics.completedOrders }} completed • {{ statistics.pendingOrders }} pending</div>
              <div class="stat-progress">
                <div class="progress-bar" [style.width.%]="getCompletionRate()"></div>
              </div>
            </div>
          </div>

          <div class="stat-card volume-card">
            <div class="stat-icon-wrapper">
              <div class="stat-icon volume-icon"></div>
              <div class="stat-badge eco">SAF</div>
            </div>
            <div class="stat-content">
              <div class="stat-title">SAF Volume</div>
              <div class="stat-value">{{ statistics.totalSafVolume | number:'1.1-1' }}L</div>
              <div class="stat-detail">Sustainable fuel • {{ (statistics.totalSafVolume * 2.5) | number:'1.0-0' }}kg CO₂ saved</div>
              <div class="stat-progress">
                <div class="progress-bar eco" [style.width.%]="getSafPercentage()"></div>
              </div>
            </div>
          </div>

          <div class="stat-card investment-card">
            <div class="stat-icon-wrapper">
              <div class="stat-icon investment-icon"></div>
              <div class="stat-trend positive"></div>
            </div>
            <div class="stat-content">
              <div class="stat-title">Total Investment</div>
              <div class="stat-value">\${{ statistics.totalRevenue | number:'1.2-2' }}</div>
              <div class="stat-detail">Average \${{ (statistics.totalRevenue / Math.max(statistics.totalOrders, 1)) | number:'1.0-0' }} per order</div>
              <div class="stat-progress">
                <div class="progress-bar investment" [style.width.%]="Math.min((statistics.totalRevenue / 50000) * 100, 100)"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Impact Section -->
        <div *ngIf="!isLoading && !error && statistics" class="impact-section">
          <div class="section-header">
            <h2 class="section-title">
              <div class="title-icon impact-icon"></div>
              Environmental Impact
            </h2>
            <div class="section-badge">🌍 Making a difference</div>
          </div>

          <div class="impact-cards">
            <div class="impact-card carbon-savings">
              <div class="impact-visual">
                <div class="impact-chart">
                  <div class="chart-circle">
                    <div class="chart-progress" [style.background]="getCircularProgress(getSafPercentage())">
                      <div class="chart-value">{{ (statistics.totalSafVolume * 2.5) | number:'1.0-0' }}</div>
                      <div class="chart-label">kg CO₂ Saved</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="impact-details">
                <div class="impact-stat">
                  <div class="stat-number">🌱 {{ statistics.totalSafVolume | number:'1.1-1' }}L</div>
                  <div class="stat-description">Sustainable Aviation Fuel</div>
                </div>
                <div class="impact-stat">
                  <div class="stat-number">🌍 {{ (statistics.totalSafVolume * 2.5) | number:'1.0-0' }}kg</div>
                  <div class="stat-description">CO₂ Emissions Reduced</div>
                </div>
                <div class="impact-stat">
                  <div class="stat-number">✈️ {{ statistics.completedOrders }}</div>
                  <div class="stat-description">Sustainable Flights Supported</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Quick Actions -->
        <div *ngIf="!isLoading && !error" class="actions-section">
          <div class="section-header">
            <h2 class="section-title">
              <div class="title-icon actions-icon"></div>
              Quick Actions
            </h2>
          </div>

          <div class="action-cards">
            <div class="action-card create-order" routerLink="/orders/create">
              <div class="action-background"></div>
              <div class="action-content">
                <div class="action-icon">➕</div>
                <div class="action-info">
                  <h3 class="action-title">Create New Order</h3>
                  <p class="action-description">Purchase SAF certificates for your next flight</p>
                </div>
                <div class="action-arrow">→</div>
              </div>
            </div>

            <div class="action-card manage-orders" routerLink="/orders">
              <div class="action-background"></div>
              <div class="action-content">
                <div class="action-icon">📋</div>
                <div class="action-info">
                  <h3 class="action-title">Manage Orders</h3>
                  <p class="action-description">View and track your certificate orders</p>
                </div>
                <div class="action-arrow">→</div>
              </div>
            </div>

            <div class="action-card profile-settings" routerLink="/profile">
              <div class="action-background"></div>
              <div class="action-content">
                <div class="action-icon">⚙️</div>
                <div class="action-info">
                  <h3 class="action-title">Account Settings</h3>
                  <p class="action-description">Update your profile and preferences</p>
                </div>
                <div class="action-arrow">→</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div *ngIf="!isLoading && !error" class="activity-section">
          <div class="section-header">
            <h2 class="section-title">
              <div class="title-icon activity-icon"></div>
              Recent Activity
            </h2>
            <button routerLink="/orders" class="view-all-btn">View All →</button>
          </div>

          <div class="activity-container">
            <div *ngIf="recentOrders && recentOrders.length > 0" class="activity-list">
              <div *ngFor="let order of recentOrders" class="activity-item">
                <div class="activity-icon-container" [class]="getActivityIconClass(order.status)">
                  <div class="activity-status-icon">{{ getActivityIcon(order.status) }}</div>
                </div>
                <div class="activity-content">
                  <div class="activity-title">Order #{{ order.id }}</div>
                  <div class="activity-details">
                    <span class="detail-item">{{ order.safVolume | number:'1.1-1' }}L SAF</span>
                    <span class="detail-item">\${{ order.priceUsd | number:'1.2-2' }}</span>
                    <span class="detail-item status-badge" [class]="'status-' + order.status.toLowerCase()">
                      {{ getStatusDisplay(order.status) }}
                    </span>
                  </div>
                </div>
                <div class="activity-time">{{ formatDate(order.createdAt) }}</div>
              </div>
            </div>

            <div *ngIf="!recentOrders || recentOrders.length === 0" class="empty-activity">
              <div class="empty-icon">📝</div>
              <h3 class="empty-title">No Recent Orders</h3>
              <p class="empty-description">Start your sustainable aviation journey today</p>
              <button routerLink="/orders/create" class="empty-action-btn">
                Create Your First Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      position: relative;
      overflow-x: hidden;
    }

    .user-dashboard-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
                  radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%);
      animation: userGlow 15s ease-in-out infinite;
    }

    @keyframes userGlow {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }

    .dashboard-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 1rem;
      position: relative;
      z-index: 1;
      animation: dashboardSlideIn 1s ease-out;
    }

    @keyframes dashboardSlideIn {
      from {
        opacity: 0;
        transform: translateY(60px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Enhanced Header */
    .dashboard-header {
      position: relative;
      margin-bottom: 3rem;
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
      background: linear-gradient(135deg,
        var(--primary-green) 0%,
        #059669 30%,
        #047857 60%,
        #065f46 100%);
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

    .welcome-badge-container {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .user-avatar {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, var(--primary-green), var(--primary-green-dark));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 700;
      color: white;
      box-shadow: 0 15px 35px rgba(34, 197, 94, 0.4);
      animation: avatarPulse 3s ease-in-out infinite;
      margin-top: -40px;
      border: 4px solid white;
    }

    @keyframes avatarPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .welcome-title {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #1a202c, #2d3748);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0 0 0.5rem 0;
    }

    .welcome-subtitle {
      color: #64748b;
      font-size: 1.1rem;
      font-weight: 500;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .action-btn {
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

    .action-btn.primary {
      background: linear-gradient(135deg, var(--primary-green), var(--primary-green-dark));
      color: white;
      box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
    }

    .action-btn.primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(34, 197, 94, 0.4);
    }

    .action-btn.secondary {
      background: rgba(255, 255, 255, 0.9);
      color: #374151;
      border: 2px solid rgba(34, 197, 94, 0.2);
    }

    .action-btn.secondary:hover {
      background: rgba(34, 197, 94, 0.1);
      border-color: var(--primary-green);
      color: var(--primary-green-dark);
    }

    /* Loading & Error States */
    .loading-container, .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      margin: 2rem 0;
    }

    .loading-content {
      text-align: center;
      color: white;
    }

    .loading-spinner {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(255, 255, 255, 0.2);
      border-top: 4px solid var(--primary-green);
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

    /* Enhanced Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      transition: all 0.4s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.7s;
    }

    .stat-card:hover::before {
      left: 100%;
    }

    .stat-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    }

    .stat-icon-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      position: relative;
    }

    .orders-icon {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
    }

    .orders-icon::after {
      content: '📋';
      animation: iconFloat 2s ease-in-out infinite;
    }

    .volume-icon {
      background: linear-gradient(135deg, #059669, #047857);
      box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3);
    }

    .volume-icon::after {
      content: '🛩️';
      animation: iconFloat 2s ease-in-out infinite 0.5s;
    }

    .investment-icon {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    }

    .investment-icon::after {
      content: '💰';
      animation: iconFloat 2s ease-in-out infinite 1s;
    }

    @keyframes iconFloat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .stat-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 700;
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      color: #92400e;
      border: 2px solid #f59e0b;
    }

    .stat-badge.eco {
      background: linear-gradient(135deg, #dcfce7, #bbf7d0);
      color: #166534;
      border: 2px solid #22c55e;
    }

    .stat-trend {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      position: relative;
      background: linear-gradient(135deg, #dcfce7, #bbf7d0);
      border: 2px solid #22c55e;
    }

    .stat-trend.positive::after {
      content: '↗️';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 0.8rem;
    }

    .stat-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 800;
      color: #1a202c;
      margin-bottom: 0.5rem;
      line-height: 1;
    }

    .stat-detail {
      font-size: 0.85rem;
      color: #64748b;
      margin-bottom: 1rem;
      line-height: 1.4;
    }

    .stat-progress {
      width: 100%;
      height: 6px;
      background: #f1f5f9;
      border-radius: 3px;
      overflow: hidden;
      position: relative;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #8b5cf6, #7c3aed);
      border-radius: 3px;
      transition: width 1.5s ease-out;
      position: relative;
    }

    .progress-bar.eco {
      background: linear-gradient(90deg, #22c55e, #16a34a);
    }

    .progress-bar.investment {
      background: linear-gradient(90deg, #3b82f6, #2563eb);
    }

    .progress-bar::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
      animation: progressShine 2s ease-in-out infinite;
    }

    @keyframes progressShine {
      0% { left: -100%; }
      100% { left: 100%; }
    }

    /* Section Headers */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0;
    }

    .title-icon {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .title-icon.impact-icon {
      background: linear-gradient(135deg, #059669, #047857);
    }

    .title-icon.impact-icon::after {
      content: '🌍';
      font-size: 1rem;
    }

    .title-icon.actions-icon {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    }

    .title-icon.actions-icon::after {
      content: '⚡';
      font-size: 1rem;
    }

    .title-icon.activity-icon {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
    }

    .title-icon.activity-icon::after {
      content: '📊';
      font-size: 1rem;
    }

    .section-badge {
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .view-all-btn {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
    }

    .view-all-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
    }

    /* Impact Section */
    .impact-section {
      margin-bottom: 3rem;
    }

    .impact-cards {
      display: grid;
      gap: 2rem;
    }

    .impact-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      display: flex;
      gap: 2rem;
      align-items: center;
    }

    .impact-visual {
      flex-shrink: 0;
    }

    .impact-chart {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chart-circle {
      position: relative;
    }

    .chart-progress {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      margin: 20px;
    }

    .chart-progress::before {
      content: '';
      position: absolute;
      inset: 8px;
      background: white;
      border-radius: 50%;
    }

    .chart-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--primary-green-dark);
      z-index: 1;
    }

    .chart-label {
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 600;
      z-index: 1;
      text-align: center;
    }

    .impact-details {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .impact-stat {
      text-align: center;
    }

    .stat-number {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 0.5rem;
    }

    .stat-description {
      font-size: 0.9rem;
      color: #64748b;
      font-weight: 500;
    }

    /* Action Cards */
    .actions-section {
      margin-bottom: 3rem;
    }

    .action-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .action-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 0;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      text-decoration: none;
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .action-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .action-card.create-order .action-background {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(5, 150, 105, 0.1));
    }

    .action-card.manage-orders .action-background {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1));
    }

    .action-card.profile-settings .action-background {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.1));
    }

    .action-card:hover .action-background {
      opacity: 1;
    }

    .action-content {
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
      z-index: 1;
    }

    .action-icon {
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .action-info {
      flex: 1;
    }

    .action-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: white;
      margin: 0 0 0.5rem 0;
    }

    .action-description {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
      line-height: 1.4;
    }

    .action-arrow {
      font-size: 1.25rem;
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.3s ease;
    }

    .action-card:hover .action-arrow {
      color: white;
      transform: translateX(4px);
    }

    /* Activity Section */
    .activity-section {
      margin-bottom: 3rem;
    }

    .activity-container {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .activity-list {
      /* Custom border styling for activity items */
    }

    .activity-item {
      padding: 1.5rem 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
      border-bottom: 1px solid #f1f5f9;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-item:hover {
      background: rgba(0, 0, 0, 0.02);
    }

    .activity-icon-container {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .activity-icon-container.activity-success {
      background: linear-gradient(135deg, #dcfce7, #bbf7d0);
      color: #166534;
    }

    .activity-icon-container.activity-warning {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      color: #92400e;
    }

    .activity-icon-container.activity-error {
      background: linear-gradient(135deg, #fee2e2, #fecaca);
      color: #991b1b;
    }

    .activity-status-icon {
      font-size: 1.1rem;
    }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.25rem;
    }

    .activity-details {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .detail-item {
      font-size: 0.85rem;
      color: #64748b;
      padding: 0.25rem 0.5rem;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 6px;
    }

    .status-badge {
      font-weight: 600;
    }

    .status-badge.status-completed {
      background: linear-gradient(135deg, #dcfce7, #bbf7d0);
      color: #166534;
    }

    .status-badge.status-pending {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      color: #92400e;
    }

    .activity-time {
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 500;
      flex-shrink: 0;
    }

    .empty-activity {
      padding: 4rem 2rem;
      text-align: center;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 0.5rem 0;
    }

    .empty-description {
      font-size: 0.9rem;
      color: #64748b;
      margin: 0 0 1.5rem 0;
    }

    .empty-action-btn {
      background: linear-gradient(135deg, var(--primary-green), var(--primary-green-dark));
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
    }

    .empty-action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .impact-card {
        flex-direction: column;
        text-align: center;
      }

      .impact-details {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .dashboard-content {
        padding: 1rem 0.5rem;
      }

      .header-main {
        flex-direction: column;
        text-align: center;
      }

      .header-actions {
        justify-content: center;
        width: 100%;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .welcome-title {
        font-size: 2rem;
      }

      .action-cards {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }

      .activity-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .activity-details {
        justify-content: flex-start;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  statistics: OrderStatistics | null = null;
  recentOrders: Order[] = [];
  isLoading = true;
  error = '';

  constructor(
    private authService: AuthService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadStatistics();
  }

  loadStatistics() {
    this.isLoading = true;
    this.orderService.getOrderStatistics().subscribe({
      next: (stats: OrderStatistics) => {
        // Transform business stats to user-relevant stats
        this.statistics = {
          totalOrders: stats.totalOrders,
          completedOrders: stats.completedOrders,
          pendingOrders: stats.pendingOrders,
          totalSafVolume: stats.totalSafVolume,
          totalRevenue: stats.totalRevenue / 0.035 // Show total customer payments, not platform revenue
        };
        this.isLoading = false;
      },
      error: (error: any) => {
        this.error = 'Failed to load statistics';
        this.isLoading = false;
      }
    });

    // Load recent orders
    this.loadRecentOrders();
  }

  loadRecentOrders() {
    this.orderService.getOrders().subscribe({
      next: (response: PagedResponse<Order>) => {
        // Get the 5 most recent orders from the response content
        this.recentOrders = response.content
          .sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
      },
      error: (error) => {
        console.error('Failed to load recent orders:', error);
        this.recentOrders = [];
      }
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }

  formatPercent(num: number): string {
    return num.toFixed(1);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCompletionRate(): number {
    if (!this.statistics || this.statistics.totalOrders === 0) return 0;
    return (this.statistics.completedOrders / this.statistics.totalOrders) * 100;
  }

  getSafPercentage(): number {
    // For demo purposes, showing SAF volume as a percentage of some max
    return Math.min((this.statistics?.totalSafVolume || 0) / 100000 * 100, 100);
  }

  getActivityIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed': return '✅';
      case 'pending': return '⏳';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  }

  getActivityIconClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed': return 'activity-success';
      case 'pending': return 'activity-warning';
      case 'cancelled': return 'activity-error';
      default: return 'activity-default';
    }
  }

  getStatusDisplay(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  getCircularProgress(percentage: number): string {
    const angle = (percentage / 100) * 360;
    return `conic-gradient(var(--primary-green) ${angle}deg, #e2e8f0 ${angle}deg)`;
  }

  // Expose Math to template
  Math = Math;
}
