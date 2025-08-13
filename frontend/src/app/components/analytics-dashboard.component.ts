import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AnalyticsService, DashboardAnalytics, RealtimeMetrics } from '../services/analytics.service';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p class="text-gray-600">Monitor your SAF certificate broker platform performance</p>
        </div>

        <!-- Real-time Metrics Banner -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 mb-8 text-white" *ngIf="realtimeMetrics">
          <h2 class="text-xl font-semibold mb-4">Real-time Metrics</h2>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold">{{ realtimeMetrics.ordersLast24h }}</div>
              <div class="text-blue-100 text-sm">Orders (24h)</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ analyticsService.formatCurrency(realtimeMetrics.revenueLast24h) }}</div>
              <div class="text-blue-100 text-sm">Revenue (24h)</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ realtimeMetrics.activeSessions }}</div>
              <div class="text-blue-100 text-sm">Active Sessions</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ realtimeMetrics.pendingOrders }}</div>
              <div class="text-blue-100 text-sm">Pending Orders</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ realtimeMetrics.processingOrders }}</div>
              <div class="text-blue-100 text-sm">Processing</div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Loading analytics...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {{ errorMessage }}
        </div>

        <!-- Analytics Content -->
        <div *ngIf="analytics && !isLoading" class="space-y-8">

          <!-- Key Metrics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Total Orders -->
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-3 bg-blue-100 rounded-lg">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Total Orders</p>
                  <p class="text-2xl font-bold text-gray-900">{{ analyticsService.formatNumber(analytics.totalOrders) }}</p>
                  <div class="flex items-center mt-1">
                    <span [ngClass]="analyticsService.getGrowthColor(analytics.ordersGrowth.rate || 0)"
                          class="text-sm font-medium">
                      {{ analyticsService.formatPercentage(analytics.ordersGrowth.rate || 0) }}
                    </span>
                    <span class="text-gray-500 text-sm ml-1">vs last month</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Total Revenue -->
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-3 bg-green-100 rounded-lg">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p class="text-2xl font-bold text-gray-900">{{ analyticsService.formatCurrency(analytics.totalRevenue) }}</p>
                  <div class="flex items-center mt-1">
                    <span [ngClass]="analyticsService.getGrowthColor(analytics.revenueGrowth.rate || 0)"
                          class="text-sm font-medium">
                      {{ analyticsService.formatPercentage(analytics.revenueGrowth.rate || 0) }}
                    </span>
                    <span class="text-gray-500 text-sm ml-1">vs last month</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Total Users -->
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-3 bg-purple-100 rounded-lg">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Total Users</p>
                  <p class="text-2xl font-bold text-gray-900">{{ analyticsService.formatNumber(analytics.totalUsers) }}</p>
                  <div class="flex items-center mt-1">
                    <span [ngClass]="analyticsService.getGrowthColor(analytics.userGrowth.rate || 0)"
                          class="text-sm font-medium">
                      {{ analyticsService.formatPercentage(analytics.userGrowth.rate || 0) }}
                    </span>
                    <span class="text-gray-500 text-sm ml-1">vs last month</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Environmental Impact -->
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-3 bg-green-100 rounded-lg">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">CO₂ Reduced</p>
                  <p class="text-2xl font-bold text-gray-900">{{ analyticsService.formatNumber(analytics.totalEmissionsReduced) }} kg</p>
                  <p class="text-sm text-green-600 mt-1">
                    ≈ {{ analyticsService.calculateTreeEquivalent(analytics.totalEmissionsReduced) | number:'1.0-0' }} trees
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Revenue Trend Chart -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
              <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p class="text-gray-500">Chart placeholder - Weekly revenue data</p>
                <!-- Chart component would go here -->
              </div>
            </div>

            <!-- Order Status Distribution -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
              <div class="space-y-3" *ngIf="analytics.orderStatusDistribution">
                <div *ngFor="let status of analytics.orderStatusDistribution"
                     class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full mr-3"
                         [ngClass]="getStatusColor(status.status)"></div>
                    <span class="text-sm font-medium text-gray-700">{{ status.status }}</span>
                  </div>
                  <div class="text-right">
                    <span class="text-sm font-bold text-gray-900">{{ status.count }}</span>
                    <span class="text-xs text-gray-500 ml-1">({{ status.percentage | number:'1.1-1' }}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Environmental Impact Section -->
          <div class="bg-white rounded-lg shadow p-6" *ngIf="analytics.environmentalImpact">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Environmental Impact</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600">
                  {{ analytics.environmentalImpact.co2Reduced | number:'1.2-2' }}
                </div>
                <div class="text-sm text-gray-600">kg CO₂ Reduced</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600">
                  {{ analytics.environmentalImpact.safUsed | number:'1.2-2' }}
                </div>
                <div class="text-sm text-gray-600">Liters SAF Used</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-green-500">
                  {{ analytics.environmentalImpact.equivalentTrees | number:'1.0-0' }}
                </div>
                <div class="text-sm text-gray-600">Tree Equivalent</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-orange-500">
                  {{ analytics.environmentalImpact.equivalentCars | number:'1.1-1' }}
                </div>
                <div class="text-sm text-gray-600">Cars Off Road/Year</div>
              </div>
            </div>
          </div>

          <!-- Payment Analytics -->
          <div class="bg-white rounded-lg shadow p-6" *ngIf="analytics.paymentMethodStats">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Payment Analytics</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Payment Methods -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">Payment Methods</h4>
                <div class="space-y-2">
                  <div *ngFor="let method of getPaymentMethods()" class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">{{ method.name }}</span>
                    <span class="text-sm font-medium text-gray-900">{{ method.count }}</span>
                  </div>
                </div>
              </div>

              <!-- Success Rate -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">Success Rate</h4>
                <div class="text-3xl font-bold text-green-600">
                  {{ analytics.paymentSuccessRate | number:'1.1-1' }}%
                </div>
                <p class="text-sm text-gray-600">Payment success rate</p>
              </div>

              <!-- Refund Rate -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">Refund Rate</h4>
                <div class="text-3xl font-bold text-orange-500">
                  {{ analytics.refundRate | number:'1.1-1' }}%
                </div>
                <p class="text-sm text-gray-600">Refund rate</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .fade-in {
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  analytics: DashboardAnalytics | null = null;
  realtimeMetrics: RealtimeMetrics | null = null;
  isLoading = true;
  errorMessage = '';

  private subscriptions: Subscription[] = [];

  constructor(public analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.loadAnalytics();
    this.subscribeToRealtimeMetrics();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.analyticsService.stopRealtimeUpdates();
  }

  /**
   * Load dashboard analytics
   */
  loadAnalytics() {
    this.isLoading = true;
    this.errorMessage = '';

    const analyticsSubscription = this.analyticsService.getDashboardAnalytics().subscribe({
      next: (response) => {
        if (response.success) {
          this.analytics = response.data;
        } else {
          this.errorMessage = response.message || 'Failed to load analytics';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Analytics error:', error);
        this.errorMessage = 'Failed to load analytics data';
        this.isLoading = false;
      }
    });

    this.subscriptions.push(analyticsSubscription);
  }

  /**
   * Subscribe to real-time metrics
   */
  subscribeToRealtimeMetrics() {
    const realtimeSubscription = this.analyticsService.getRealtimeMetricsObservable().subscribe({
      next: (metrics) => {
        this.realtimeMetrics = metrics;
      },
      error: (error) => {
        console.error('Real-time metrics error:', error);
      }
    });

    this.subscriptions.push(realtimeSubscription);
  }

  /**
   * Get status color class
   */
  getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'DELIVERED':
        return 'bg-green-500';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'PROCESSING':
        return 'bg-blue-500';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  /**
   * Get payment methods array
   */
  getPaymentMethods(): Array<{ name: string; count: number }> {
    if (!this.analytics?.paymentMethodStats) return [];

    return Object.entries(this.analytics.paymentMethodStats).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count
    }));
  }

  /**
   * Refresh analytics data
   */
  refreshAnalytics() {
    this.loadAnalytics();
  }

  /**
   * Export analytics data
   */
  exportData(format: string = 'json') {
    this.analyticsService.exportAnalyticsData(format).subscribe({
      next: (response) => {
        if (response.success) {
          // Handle export download
          const dataStr = JSON.stringify(response.data, null, 2);
          const dataBlob = new Blob([dataStr], { type: `application/${format}` });
          const url = URL.createObjectURL(dataBlob);

          const link = document.createElement('a');
          link.href = url;
          link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.${format}`;
          link.click();

          URL.revokeObjectURL(url);
        }
      },
      error: (error) => {
        console.error('Export error:', error);
      }
    });
  }
}
