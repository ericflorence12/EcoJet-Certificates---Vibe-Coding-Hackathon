import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService, Certificate } from '../services/order.service';
import { ErrorService } from '../services/error.service';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="certificates-container">
      <!-- Enhanced Header Section -->
      <div class="certificates-header">
        <div class="header-background"></div>
        <div class="header-content">
          <div class="header-main">
            <div class="title-section">
              <div class="title-icon">🏆</div>
              <div class="title-content">
                <h1 class="page-title">SAF Certificates</h1>
                <p class="page-subtitle">View and download your sustainable aviation fuel certificates</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading your certificates...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="error-container">
        <div class="error-card">
          <div class="error-icon">⚠️</div>
          <div class="error-content">
            <h3 class="error-title">Something went wrong</h3>
            <p class="error-message">{{ error }}</p>
            <button (click)="loadCertificates()" class="retry-btn">
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>

      <!-- Certificates Content -->
      <div *ngIf="!isLoading && !error" class="certificates-content">
        <!-- Certificates List -->
        <div class="certificates-list" *ngIf="certificates.length > 0">
          <div class="certificate-card" *ngFor="let certificate of certificates; trackBy: trackByCertificateId">
            <div class="certificate-header">
              <div class="certificate-info">
                <div class="certificate-number">{{ certificate.certNumber }}</div>
                <div class="certificate-status">
                  <div class="status-badge verified">✅ Verified</div>
                </div>
              </div>
              <div class="issue-date">{{ formatDate(certificate.issueDate) }}</div>
            </div>

            <div class="certificate-body">
              <div class="flight-details">
                <div class="flight-header">
                  <div class="flight-icon">✈️</div>
                  <div class="flight-info">
                    <div class="flight-number">{{ certificate.order.flightNumber }}</div>
                    <div class="flight-route">{{ certificate.order.departureAirport }} → {{ certificate.order.arrivalAirport }}</div>
                    <div class="registry-info">Registry: {{ certificate.registryId }}</div>
                  </div>
                </div>
              </div>

              <div class="environmental-impact">
                <h4 class="impact-title">Environmental Impact</h4>
                <div class="impact-metrics">
                  <div class="impact-metric">
                    <div class="metric-icon">🛩️</div>
                    <div class="metric-content">
                      <div class="metric-value">{{ certificate.order.safVolume | number:'1.2-2' }}L</div>
                      <div class="metric-label">Sustainable Aviation Fuel</div>
                    </div>
                  </div>
                  <div class="impact-metric">
                    <div class="metric-icon">🌱</div>
                    <div class="metric-content">
                      <div class="metric-value">{{ (certificate.order.safVolume * 2.5) | number:'1.0-0' }}kg</div>
                      <div class="metric-label">CO₂ Emissions Reduced</div>
                    </div>
                  </div>
                  <div class="impact-metric">
                    <div class="metric-icon">💰</div>
                    <div class="metric-content">
                      <div class="metric-value">{{ certificate.order.priceUsd | currency:'USD':'symbol':'1.2-2' }}</div>
                      <div class="metric-label">Investment in Sustainability</div>
                    </div>
                  </div>
                  <div class="impact-metric">
                    <div class="metric-icon">📊</div>
                    <div class="metric-content">
                      <div class="metric-value">{{ certificate.order.flightEmissions | number:'1.0-0' }}kg</div>
                      <div class="metric-label">Total Flight Emissions</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="certificate-features">
                <div class="feature-list">
                  <div class="feature-item">
                    <div class="feature-icon">🌍</div>
                    <span>Reduce carbon footprint</span>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">✈️</div>
                    <span>Support sustainable aviation</span>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">📋</div>
                    <span>Official documentation</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="certificate-actions">
              <button
                (click)="downloadCertificate(certificate.id)"
                class="action-btn download-btn"
                title="Download PDF Certificate"
              >
                📄 Download PDF
              </button>
              <button
                (click)="shareCertificate(certificate)"
                class="action-btn share-btn"
                title="Share Certificate"
              >
                📤 Share
              </button>
              <button
                (click)="viewCertificateDetails(certificate)"
                class="action-btn view-btn"
                title="View Details"
              >
                👁️ View Details
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="certificates.length === 0" class="empty-state">
          <div class="empty-illustration">
            <div class="empty-icon">📋</div>
            <div class="empty-graphics">
              <div class="empty-circle circle-1"></div>
              <div class="empty-circle circle-2"></div>
              <div class="empty-circle circle-3"></div>
            </div>
          </div>
          <h3 class="empty-title">No Certificates Yet</h3>
          <p class="empty-description">
            You don't have any SAF certificates yet. Complete an order to receive
            your first certificate and start making a positive environmental impact.
          </p>

          <div class="empty-features">
            <div class="feature-highlight">
              <div class="feature-icon">🌍</div>
              <div class="feature-text">
                <strong>Reduce</strong><br>
                carbon footprint
              </div>
            </div>
            <div class="feature-highlight">
              <div class="feature-icon">✈️</div>
              <div class="feature-text">
                <strong>Support</strong><br>
                sustainable aviation
              </div>
            </div>
            <div class="feature-highlight">
              <div class="feature-icon">📋</div>
              <div class="feature-text">
                <strong>Official</strong><br>
                documentation
              </div>
            </div>
          </div>

          <div class="empty-actions">
            <button routerLink="/orders/create" class="btn btn-primary">
              🚀 Create Your First Order
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .certificates-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      position: relative;
      overflow-x: hidden;
    }

    .certificates-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
                  radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%);
      animation: certificatesGlow 15s ease-in-out infinite;
    }

    @keyframes certificatesGlow {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }

    /* Content Wrapper for Layout Consistency */
    .certificates-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0;
      position: relative;
      z-index: 1;
    }

    /* Enhanced Header */
    .certificates-header {
      position: relative;
      max-width: 1400px;
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
      background: linear-gradient(135deg,
        #f59e0b 0%,
        #f97316 30%,
        #ea580c 60%,
        #dc2626 100%);
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
      background: linear-gradient(135deg, #f59e0b, #f97316);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      box-shadow: 0 15px 35px rgba(245, 158, 11, 0.4);
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

    /* Loading & Error States */
    .loading-container, .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      max-width: 1400px;
      margin: 2rem auto;
    }

    .loading-content {
      text-align: center;
      color: white;
    }

    .loading-spinner {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(255, 255, 255, 0.2);
      border-top: 4px solid #f59e0b;
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

    /* Certificates Content */
    .certificates-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0;
      position: relative;
      z-index: 1;
    }

    .certificates-list {
      display: grid;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .certificate-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      border: 2px solid #e2e8f0;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      overflow: hidden;
      position: relative;
    }

    .certificate-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #f59e0b, #d97706, #92400e);
    }

    .certificate-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
      border-color: #f59e0b;
    }

    .certificate-header {
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .certificate-info {
      flex: 1;
    }

    .certificate-status {
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }

    .certificate-number {
      font-weight: 700;
      color: #1a202c;
      font-size: 1.3rem;
      margin-bottom: 0.5rem;
      font-family: 'Courier New', monospace;
      letter-spacing: 0.5px;
    }

    .issue-date {
      color: #64748b;
      font-size: 0.9rem;
      font-style: italic;
    }

    .status-badge {
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      width: fit-content;
    }

    .status-badge.verified {
      background: linear-gradient(135deg, #dcfce7, #bbf7d0);
      color: #166534;
      border: 2px solid #22c55e;
    }

    .issue-date {
      color: #64748b;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .certificate-body {
      padding: 1.5rem;
    }

    .flight-details {
      margin-bottom: 1.5rem;
      padding: 1.25rem;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: 12px;
      border: 1px solid #cbd5e1;
    }

    .flight-header {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .flight-icon {
      font-size: 1.8rem;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .flight-info {
      flex: 1;
    }

    .flight-number {
      font-weight: 700;
      color: #1a202c;
      font-size: 1.2rem;
      font-family: 'Courier New', monospace;
      margin-bottom: 0.25rem;
    }

    .flight-route {
      color: #475569;
      font-size: 1rem;
      font-weight: 600;
      margin: 0.25rem 0;
    }

    .registry-info {
      color: #64748b;
      font-size: 0.85rem;
      font-style: italic;
    }

    .environmental-impact {
      margin-bottom: 1.5rem;
    }

    .impact-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1a202c;
      margin: 0 0 1.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #f59e0b;
    }

    .impact-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }

    .impact-metric {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border-radius: 12px;
      border: 1px solid #f59e0b;
      transition: all 0.3s ease;
    }

    .impact-metric:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(245, 158, 11, 0.15);
    }

    .metric-icon {
      font-size: 1.6rem;
      width: 45px;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-radius: 50%;
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .metric-content {
      flex: 1;
    }

    .metric-value {
      font-size: 1.4rem;
      font-weight: 700;
      color: #92400e;
      line-height: 1.2;
    }

    .metric-label {
      font-size: 0.85rem;
      color: #78716c;
      font-weight: 600;
      margin-top: 0.25rem;
    }

    .certificate-features {
      margin-bottom: 1rem;
    }

    .feature-list {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #64748b;
      font-weight: 500;
    }

    .feature-icon {
      font-size: 1rem;
    }

    .certificate-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid #f1f5f9;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .action-btn {
      padding: 0.75rem 1rem;
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

    .download-btn {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
    }

    .share-btn {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
    }

    .view-btn {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
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
      max-width: 600px;
      margin: 0 auto;
    }

    .empty-illustration {
      position: relative;
      margin-bottom: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .empty-icon {
      font-size: 5rem;
      opacity: 0.3;
      z-index: 2;
      position: relative;
    }

    .empty-graphics {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .empty-circle {
      position: absolute;
      border: 2px solid rgba(245, 158, 11, 0.2);
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;
    }

    .circle-1 {
      width: 80px;
      height: 80px;
      top: -40px;
      left: -40px;
      animation-delay: 0s;
    }

    .circle-2 {
      width: 120px;
      height: 120px;
      top: -60px;
      left: -60px;
      animation-delay: 2s;
    }

    .circle-3 {
      width: 160px;
      height: 160px;
      top: -80px;
      left: -80px;
      animation-delay: 4s;
    }

    @keyframes float {
      0%, 100% {
        opacity: 0.2;
        transform: scale(1);
      }
      50% {
        opacity: 0.4;
        transform: scale(1.1);
      }
    }

    .empty-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 1rem 0;
    }

    .empty-description {
      color: #64748b;
      margin: 0 0 2rem 0;
      line-height: 1.6;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .empty-features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .feature-highlight {
      text-align: center;
      padding: 1rem;
      background: rgba(245, 158, 11, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(245, 158, 11, 0.1);
    }

    .feature-highlight .feature-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      display: block;
    }

    .feature-text {
      font-size: 0.9rem;
      color: #64748b;
      line-height: 1.4;
    }

    .feature-text strong {
      color: #374151;
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

    /* Responsive Design */
    @media (max-width: 768px) {
      .certificates-header {
        margin: 1rem;
      }

      .header-main {
        flex-direction: column;
        text-align: center;
      }

      .certificates-content {
        padding: 0 1rem;
      }

      .impact-metrics {
        grid-template-columns: 1fr;
      }

      .feature-list {
        flex-direction: column;
        align-items: center;
      }

      .certificate-actions {
        justify-content: center;
      }

      .empty-features {
        grid-template-columns: 1fr;
      }
    }

    /* CSS Variables */
    :root {
      --primary-green: #22c55e;
      --primary-green-dark: #16a34a;
    }
  `]
})
export class CertificatesComponent implements OnInit {
  certificates: Certificate[] = [];
  isLoading = true;
  error = '';

  constructor(
    private orderService: OrderService,
    private errorService: ErrorService
  ) {}

  ngOnInit() {
    this.loadCertificates();
  }

  loadCertificates() {
    this.isLoading = true;
    this.error = '';

    this.orderService.getCertificates().subscribe({
      next: (certificates) => {
        this.certificates = certificates;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load certificates:', error);
        this.errorService.showApiError(error);
        this.error = 'Failed to load certificates. Please try again.';
        this.isLoading = false;
      }
    });
  }

  downloadCertificate(certificateId: number) {
    this.orderService.downloadCertificate(certificateId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${certificateId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        console.error('Failed to download certificate:', error);
        this.errorService.showApiError(error);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }

  getCertificateStatus(certificate: Certificate): string {
    // All certificates from the API are currently valid/verified
    return 'valid';
  }

  getCertificateStatusText(certificate: Certificate): string {
    const status = this.getCertificateStatus(certificate);

    switch (status) {
      case 'expired':
        return 'Expired';
      case 'expiring-soon':
        return 'Expiring Soon';
      default:
        return 'Valid';
    }
  }

  getCertificateStatusClass(certificate: Certificate): string {
    const status = this.getCertificateStatus(certificate);

    switch (status) {
      case 'expired':
        return 'status-expired';
      case 'expiring-soon':
        return 'status-expiring';
      default:
        return 'status-valid';
    }
  }

  // Additional methods for the new template
  trackByCertificateId(index: number, certificate: Certificate): any {
    return certificate.id;
  }

  formatFlightDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  shareCertificate(certificate: Certificate) {
    if (navigator.share) {
      navigator.share({
        title: `SAF Certificate #${certificate.id}`,
        text: `Check out my sustainable aviation fuel certificate #${certificate.certNumber}`,
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Certificate link copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy link:', err);
      });
    }
  }

  viewCertificateDetails(certificate: Certificate) {
    // Navigate to certificate details or show modal
    console.log('Viewing certificate details:', certificate);
    // You could implement a modal or navigate to a details page
    alert(`Certificate Details:\nCertificate: ${certificate.certNumber}\nFlight: ${certificate.order.flightNumber}\nSAF Volume: ${certificate.order.safVolume}L\nCO₂ Saved: ${(certificate.order.safVolume * 2.5).toFixed(0)}kg`);
  }
}
