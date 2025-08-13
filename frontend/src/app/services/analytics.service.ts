import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
// import { environment } from '../../environments/environment';

const environment = {
  apiUrl: 'http://localhost:8080'
};

export interface DashboardAnalytics {
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  totalSafVolume: number;
  totalEmissionsReduced: number;
  ordersGrowth: GrowthMetric;
  revenueGrowth: GrowthMetric;
  userGrowth: GrowthMetric;
  weeklyMetrics: WeeklyMetric[];
  monthlyMetrics: MonthlyMetric[];
  orderStatusDistribution: StatusDistribution[];
  averageOrderValue: number;
  environmentalImpact: EnvironmentalImpact;
  paymentMethodStats: { [key: string]: number };
  paymentSuccessRate: number;
  refundRate: number;
}

export interface GrowthMetric {
  current: number;
  previous: number;
  rate: number;
}

export interface WeeklyMetric {
  week: string;
  orders: number;
  revenue: number;
  safVolume: number;
  emissions: number;
}

export interface MonthlyMetric {
  month: string;
  year: number;
  orders: number;
  revenue: number;
  newUsers: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface EnvironmentalImpact {
  co2Reduced: number;
  safUsed: number;
  equivalentTrees: number;
  equivalentCars: number;
  impactScore: number;
}

export interface RealtimeMetrics {
  ordersLast24h: number;
  revenueLast24h: number;
  activeSessions: number;
  pendingOrders: number;
  processingOrders: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private baseUrl = environment.apiUrl;
  private realtimeMetrics$ = new BehaviorSubject<RealtimeMetrics | null>(null);
  private refreshInterval: any;

  constructor(private http: HttpClient) {
    this.startRealtimeUpdates();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Get comprehensive dashboard analytics
   */
  getDashboardAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/analytics/dashboard`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get real-time metrics
   */
  getRealtimeMetrics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/analytics/realtime`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get real-time metrics as observable
   */
  getRealtimeMetricsObservable(): Observable<RealtimeMetrics | null> {
    return this.realtimeMetrics$.asObservable();
  }

  /**
   * Get order analytics
   */
  getOrderAnalytics(period?: string, status?: string): Observable<any> {
    let params = '';
    if (period) params += `period=${period}&`;
    if (status) params += `status=${status}&`;

    return this.http.get<any>(`${this.baseUrl}/api/analytics/orders?${params}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get payment analytics
   */
  getPaymentAnalytics(period?: string, method?: string): Observable<any> {
    let params = '';
    if (period) params += `period=${period}&`;
    if (method) params += `method=${method}&`;

    return this.http.get<any>(`${this.baseUrl}/api/analytics/payments?${params}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get environmental analytics
   */
  getEnvironmentalAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/analytics/environmental`);
  }

  /**
   * Get user engagement analytics
   */
  getUserEngagementAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/analytics/engagement`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Export analytics data
   */
  exportAnalyticsData(format: string, period?: string, metrics?: string[]): Observable<any> {
    let params = `format=${format}&`;
    if (period) params += `period=${period}&`;
    if (metrics && metrics.length > 0) {
      metrics.forEach(metric => params += `metrics=${metric}&`);
    }

    return this.http.get<any>(`${this.baseUrl}/api/analytics/export?${params}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Start real-time metric updates
   */
  private startRealtimeUpdates() {
    this.refreshInterval = setInterval(() => {
      this.getRealtimeMetrics().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.realtimeMetrics$.next(response.data);
          }
        },
        error: (error) => {
          console.error('Failed to fetch real-time metrics:', error);
        }
      });
    }, 30000); // Update every 30 seconds
  }

  /**
   * Stop real-time updates
   */
  stopRealtimeUpdates() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Format large numbers for display
   */
  formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Format percentage
   */
  formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  }

  /**
   * Get growth color class
   */
  getGrowthColor(rate: number): string {
    if (rate > 0) return 'text-green-500';
    if (rate < 0) return 'text-red-500';
    return 'text-gray-500';
  }

  /**
   * Get growth icon
   */
  getGrowthIcon(rate: number): string {
    if (rate > 0) return 'trend-up';
    if (rate < 0) return 'trend-down';
    return 'minus';
  }

  /**
   * Calculate environmental impact equivalents
   */
  calculateTreeEquivalent(co2Reduced: number): number {
    return co2Reduced * 0.06; // Rough conversion factor
  }

  /**
   * Calculate car equivalent
   */
  calculateCarEquivalent(co2Reduced: number): number {
    return co2Reduced / 4600; // Average car emissions per year
  }

  /**
   * Get sustainability score color
   */
  getSustainabilityScoreColor(score: number): string {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  }

  /**
   * Generate chart colors
   */
  getChartColors(): string[] {
    return [
      '#3B82F6', // blue-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#EF4444', // red-500
      '#8B5CF6', // violet-500
      '#06B6D4', // cyan-500
      '#84CC16', // lime-500
      '#F97316'  // orange-500
    ];
  }

  /**
   * Process chart data for time series
   */
  processTimeSeriesData(data: any[], xKey: string, yKey: string): any {
    return {
      labels: data.map(item => item[xKey]),
      datasets: [{
        data: data.map(item => item[yKey]),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  }

  /**
   * Process pie chart data
   */
  processPieChartData(data: { [key: string]: number }): any {
    const labels = Object.keys(data);
    const values = Object.values(data);

    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: this.getChartColors().slice(0, labels.length)
      }]
    };
  }

  /**
   * Calculate trend direction
   */
  getTrendDirection(current: number, previous: number): 'up' | 'down' | 'stable' {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  }

  /**
   * Cleanup resources
   */
  ngOnDestroy() {
    this.stopRealtimeUpdates();
  }
}
