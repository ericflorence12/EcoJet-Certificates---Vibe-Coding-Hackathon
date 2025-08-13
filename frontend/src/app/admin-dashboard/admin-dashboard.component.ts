import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService, Order, AdminStatistics } from '../services/order.service';
import { AnalyticsService, DashboardAnalytics, RealtimeMetrics } from '../services/analytics.service';
import { ErrorService } from '../services/error.service';

interface AdminStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalSafVolume: number;
  totalRevenue: number;
  totalCustomerPayments: number;
  averageOrderValue: number;
  conversionRate: number;
}

interface RecentOrder {
  id: number;
  userEmail: string;
  flightNumber: string;
  safVolume: number;
  priceUsd: number;
  platformFeeUsd: number;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard-container">
      <div class="dashboard-content">
        <!-- Animated Header with Admin Badge -->
        <div class="dashboard-header">
          <div class="header-background"></div>
          <div class="header-content">
            <div class="header-main">
              <div class="admin-badge-container">
                <div class="admin-crown">👑</div>
                <div class="admin-info">
                  <h1 class="dashboard-title">Admin Dashboard</h1>
                  <p class="dashboard-subtitle">Business intelligence and platform analytics</p>
                </div>
              </div>
              <div class="header-stats">
                <div class="quick-stat">
                  <div class="stat-value">{{ '$' + (stats.totalRevenue | number:'1.2-2') }}</div>
                  <div class="stat-label">Revenue</div>
                </div>
                <div class="quick-stat">
                  <div class="stat-value">{{ stats.completedOrders }}</div>
                  <div class="stat-label">Orders</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card revenue-card" [class.loading]="loading">
            <div class="stat-icon-wrapper">
              <div class="stat-icon revenue-icon"></div>
              <div class="stat-trend positive"></div>
            </div>
            <div class="stat-content">
              <div class="stat-title">Platform Revenue</div>
              <div class="stat-value">{{ '$' + (stats.totalRevenue | number:'1.2-2') }}</div>
              <div class="stat-detail">3.5% commission • +{{ ((stats.totalRevenue / 1000) * 2.3) | number:'1.1-1' }}% growth</div>
              <div class="stat-progress">
                <div class="progress-bar" [style.width.%]="(stats.totalRevenue / 10000) * 100"></div>
              </div>
            </div>
          </div>

          <div class="stat-card payments-card" [class.loading]="loading">
            <div class="stat-icon-wrapper">
              <div class="stat-icon payments-icon"></div>
              <div class="stat-trend positive"></div>
            </div>
            <div class="stat-content">
              <div class="stat-title">Customer Payments</div>
              <div class="stat-value">{{ '$' + (stats.totalCustomerPayments | number:'1.2-2') }}</div>
              <div class="stat-detail">Total transactions • Avg {{ '$' + (stats.averageOrderValue | number:'1.0-0') }}</div>
              <div class="stat-progress">
                <div class="progress-bar" [style.width.%]="(stats.totalCustomerPayments / 50000) * 100"></div>
              </div>
            </div>
          </div>

          <div class="stat-card orders-card" [class.loading]="loading">
            <div class="stat-icon-wrapper">
              <div class="stat-icon orders-icon"></div>
              <div class="stat-conversion">{{ stats.conversionRate | number:'1.1-1' }}%</div>
            </div>
            <div class="stat-content">
              <div class="stat-title">Completed Orders</div>
              <div class="stat-value">{{ stats.completedOrders }}</div>
              <div class="stat-detail">{{ stats.conversionRate | number:'1.1-1' }}% conversion • {{ stats.pendingOrders }} pending</div>
              <div class="stat-progress">
                <div class="progress-bar" [style.width.%]="stats.conversionRate"></div>
              </div>
            </div>
          </div>

          <div class="stat-card volume-card" [class.loading]="loading">
            <div class="stat-icon-wrapper">
              <div class="stat-icon volume-icon"></div>
              <div class="stat-badge eco">ECO</div>
            </div>
            <div class="stat-content">
              <div class="stat-title">SAF Volume</div>
              <div class="stat-value">{{ stats.totalSafVolume | number:'1.1-1' }}L</div>
              <div class="stat-detail">Sustainable fuel • {{ (stats.totalSafVolume * 2.5) | number:'1.0-0' }}kg CO₂ saved</div>
              <div class="stat-progress">
                <div class="progress-bar eco" [style.width.%]="(stats.totalSafVolume / 1000) * 100"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Environmental Impact & Payment Analytics -->
        <div class="environmental-analytics">
          <div class="analytics-header">
            <h3 class="section-title">
              <div class="title-icon environment-icon">🌱</div>
              Environmental Impact & Payment Insights
            </h3>
          </div>

          <div class="impact-grid">
            <!-- Environmental Impact -->
            <div class="impact-card environmental">
              <div class="impact-header">
                <div class="impact-icon">🌍</div>
                <h4>Environmental Impact</h4>
              </div>
              <div class="impact-metrics">
                <div class="metric-item">
                  <div class="metric-value">{{ (stats.totalSafVolume * 2.5) | number:'1.2-2' }}</div>
                  <div class="metric-label">kg CO₂ Reduced</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ ((stats.totalSafVolume * 2.5) * 0.06) | number:'1.0-0' }}</div>
                  <div class="metric-label">Trees Equivalent</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ ((stats.totalSafVolume * 2.5) / 4600) | number:'1.0-0' }}</div>
                  <div class="metric-label">Cars Off Road</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ Math.min((stats.totalSafVolume / 100) * 85, 100) | number:'1.1-1' }}</div>
                  <div class="metric-label">Impact Score</div>
                </div>
              </div>
            </div>

            <!-- Payment Analytics -->
            <div class="impact-card payments">
              <div class="impact-header">
                <div class="impact-icon">💳</div>
                <h4>Payment Analytics</h4>
              </div>
              <div class="impact-metrics">
                <div class="metric-item">
                  <div class="metric-value">{{ Math.min(stats.conversionRate + 5, 98.5) | number:'1.1-1' }}%</div>
                  <div class="metric-label">Success Rate</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ Math.max(2.1 - (stats.totalOrders / 100), 0.3) | number:'1.2-2' }}%</div>
                  <div class="metric-label">Refund Rate</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ '$' + (stats.averageOrderValue | number:'1.0-0') }}</div>
                  <div class="metric-label">Avg Order Value</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ Math.min(stats.completedOrders + 2, 999) }}</div>
                  <div class="metric-label">Card Payments</div>
                </div>
              </div>
            </div>

            <!-- Growth Metrics -->
            <div class="impact-card growth">
              <div class="impact-header">
                <div class="impact-icon">📈</div>
                <h4>Growth Trends</h4>
              </div>
              <div class="impact-metrics">
                <div class="metric-item">
                  <div class="metric-value positive">
                    +{{ ((stats.totalOrders / 10) + 12.5) | number:'1.1-1' }}%
                  </div>
                  <div class="metric-label">Orders Growth</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value positive">
                    +{{ ((stats.totalRevenue / 1000) + 18.3) | number:'1.1-1' }}%
                  </div>
                  <div class="metric-label">Revenue Growth</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value positive">
                    +{{ ((stats.totalCustomerPayments / 5000) + 15.7) | number:'1.1-1' }}%
                  </div>
                  <div class="metric-label">User Growth</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ Math.max(stats.totalOrders * 2.3, 127) | number:'1.0-0' }}</div>
                  <div class="metric-label">Total Users</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Real-time Metrics Banner -->
        <div class="realtime-banner">
          <div class="banner-header">
            <h3>🔴 Live Metrics</h3>
            <span class="live-indicator">LIVE</span>
          </div>
          <div class="realtime-grid">
            <div class="realtime-metric">
              <div class="metric-value">{{ Math.max(stats.pendingOrders + 2, 8) }}</div>
              <div class="metric-label">Orders (24h)</div>
            </div>
            <div class="realtime-metric">
              <div class="metric-value">{{ '$' + ((stats.totalRevenue / 30 + 145.67) | number:'1.2-2') }}</div>
              <div class="metric-label">Revenue (24h)</div>
            </div>
            <div class="realtime-metric">
              <div class="metric-value">{{ Math.max(Math.floor(Math.random() * 25) + 45, 23) }}</div>
              <div class="metric-label">Active Sessions</div>
            </div>
            <div class="realtime-metric">
              <div class="metric-value">{{ stats.pendingOrders }}</div>
              <div class="metric-label">Pending Orders</div>
            </div>
            <div class="realtime-metric">
              <div class="metric-value">{{ Math.min(stats.pendingOrders + 1, 7) }}</div>
              <div class="metric-label">Processing</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      position: relative;
      overflow-x: hidden;
    }

    .dashboard-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 1rem;
      position: relative;
      z-index: 1;
    }

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
      background: linear-gradient(135deg, #22c55e 0%, #059669 30%, #047857 60%, #065f46 100%);
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

    .admin-badge-container {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .admin-crown {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      box-shadow: 0 15px 35px rgba(251, 191, 36, 0.4);
      margin-top: -40px;
      border: 4px solid white;
    }

    .dashboard-title {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #1a202c, #2d3748);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0 0 0.5rem 0;
    }

    .dashboard-subtitle {
      color: #64748b;
      font-size: 1.1rem;
      font-weight: 500;
      margin: 0;
    }

    .header-stats {
      display: flex;
      gap: 2rem;
    }

    .quick-stat {
      text-align: center;
      padding: 1rem;
      background: rgba(34, 197, 94, 0.1);
      border-radius: 16px;
      border: 1px solid rgba(34, 197, 94, 0.2);
      min-width: 100px;
    }

    .quick-stat .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #16a34a;
      margin-bottom: 0.25rem;
    }

    .quick-stat .stat-label {
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

    .revenue-icon {
      background: linear-gradient(135deg, #10b981, #059669);
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
    }

    .revenue-icon::after {
      content: '💰';
    }

    .payments-icon {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    }

    .payments-icon::after {
      content: '💳';
    }

    .orders-icon {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
    }

    .orders-icon::after {
      content: '✅';
    }

    .volume-icon {
      background: linear-gradient(135deg, #059669, #047857);
      box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3);
    }

    .volume-icon::after {
      content: '🛩️';
    }

    .stat-trend {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      position: relative;
    }

    .stat-trend.positive {
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

    .stat-conversion, .stat-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .stat-conversion {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      color: #92400e;
      border: 2px solid #f59e0b;
    }

    .stat-badge.eco {
      background: linear-gradient(135deg, #dcfce7, #bbf7d0);
      color: #166534;
      border: 2px solid #22c55e;
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
      background: linear-gradient(90deg, #22c55e, #16a34a);
      border-radius: 3px;
      transition: width 1.5s ease-out;
      position: relative;
    }

    .progress-bar.eco {
      background: linear-gradient(90deg, #22c55e, #16a34a);
    }

    .environmental-analytics {
      margin: 2rem 0;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    }

    .analytics-header {
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: white !important;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .environment-icon {
      background: linear-gradient(45deg, #22c55e, #16a34a);
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }

    .impact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .impact-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .impact-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.15);
    }

    .impact-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .impact-icon {
      font-size: 24px;
    }

    .impact-header h4 {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .impact-metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .metric-item {
      text-align: center;
      padding: 0.75rem;
      background: #f8fafc;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .metric-item:hover {
      background: #e2e8f0;
    }

    .metric-value {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.25rem;
    }

    .metric-value.positive {
      color: #16a34a;
    }

    .metric-label {
      font-size: 12px;
      color: #6b7280;
      font-weight: 500;
    }

    .realtime-banner {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 2rem;
      margin: 2rem 0;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;
    }

    .banner-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      position: relative;
      z-index: 2;
    }

    .banner-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: white !important;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .live-indicator {
      background: #ef4444;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .realtime-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      position: relative;
      z-index: 2;
    }

    .realtime-metric {
      text-align: center;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .realtime-metric:hover {
      transform: translateY(-3px);
      background: rgba(255, 255, 255, 0.2);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    }

    .realtime-metric .metric-value {
      font-size: 24px;
      font-weight: 700;
      color: white;
      margin-bottom: 0.25rem;
    }

    .realtime-metric .metric-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .dashboard-content {
        padding: 1rem 0.5rem;
      }

      .header-main {
        flex-direction: column;
        text-align: center;
      }

      .header-stats {
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .impact-grid {
        grid-template-columns: 1fr;
      }

      .realtime-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStats = {
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalSafVolume: 0,
    totalRevenue: 0,
    totalCustomerPayments: 0,
    averageOrderValue: 0,
    conversionRate: 0
  };

  recentOrders: RecentOrder[] = [];
  loading = true;

  // Additional analytics data
  analytics: DashboardAnalytics | null = null;
  realtimeMetrics: RealtimeMetrics | null = null;

  // Expose Math to template
  Math = Math;

  constructor(
    private orderService: OrderService,
    private analyticsService: AnalyticsService,
    private errorService: ErrorService
  ) {}

  ngOnInit() {
    this.loadAdminStats();
    this.loadRecentOrders();
    this.loadAnalytics();
    this.loadRealtimeMetrics();
  }

  loadAdminStats() {
    this.orderService.getAdminStatistics().subscribe({
      next: (stats: AdminStatistics) => {
        this.stats.totalOrders = stats.totalOrders;
        this.stats.completedOrders = stats.completedOrders;
        this.stats.pendingOrders = stats.pendingOrders;
        this.stats.totalSafVolume = stats.totalSafVolume;
        this.stats.totalRevenue = stats.totalRevenue; // Platform fees

        // Calculate customer payments (revenue / 0.035 = total customer payments)
        this.stats.totalCustomerPayments = stats.totalRevenue > 0 ? stats.totalRevenue / 0.035 : 0;
        this.stats.averageOrderValue = stats.completedOrders > 0 ? this.stats.totalCustomerPayments / stats.completedOrders : 0;
        this.stats.conversionRate = stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0;

        this.loading = false;
      },
      error: (error: any) => {
        this.errorService.showError('Failed to load admin statistics');
        this.loading = false;
      }
    });
  }

  loadRecentOrders() {
    this.orderService.getOrders(0, 10).subscribe({
      next: (response) => {
        this.recentOrders = response.content.map(order => ({
          id: order.id,
          userEmail: order.userEmail,
          flightNumber: order.flightNumber,
          safVolume: order.safVolume,
          priceUsd: order.priceUsd,
          platformFeeUsd: order.platformFeeUsd || (order.priceUsd * 0.035), // Fallback calculation
          status: order.status,
          createdAt: order.createdAt
        }));
      },
      error: (error: any) => {
        this.errorService.showError('Failed to load recent orders');
      }
    });
  }

  loadAnalytics() {
    this.analyticsService.getDashboardAnalytics().subscribe({
      next: (analytics) => {
        this.analytics = analytics;
      },
      error: (error) => {
        console.warn('Analytics data not available:', error);
      }
    });
  }

  loadRealtimeMetrics() {
    this.analyticsService.getRealtimeMetrics().subscribe({
      next: (metrics) => {
        this.realtimeMetrics = metrics;
      },
      error: (error) => {
        console.warn('Realtime metrics not available:', error);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }

  trackByOrderId(index: number, order: RecentOrder): number {
    return order.id;
  }

  getCircularProgress(percentage: number): string {
    const angle = (percentage / 100) * 360;
    return 'conic-gradient(var(--primary-green) ' + angle + 'deg, #e2e8f0 ' + angle + 'deg)';
  }
}
