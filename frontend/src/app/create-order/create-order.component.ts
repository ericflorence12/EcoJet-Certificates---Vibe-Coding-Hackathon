import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService, QuoteRequest, Quote, OrderRequest } from '../services/order.service';
import { ErrorService } from '../services/error.service';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="create-order-container">
      <!-- Enhanced Header Section -->
      <div class="create-order-header">
        <div class="header-background"></div>
        <div class="header-content">
          <div class="header-main">
            <div class="title-section">
              <div class="title-icon">✈️</div>
              <div class="title-content">
                <h1 class="page-title">Create New Order</h1>
                <p class="page-subtitle">Calculate emissions and purchase SAF certificates for your flight</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Steps -->
      <div class="progress-section">
        <div class="progress-container">
          <div class="progress-steps">
            <div class="step" [class.active]="step >= 1" [class.completed]="step > 1">
              <div class="step-number">1</div>
              <div class="step-label">Flight Details</div>
            </div>
            <div class="step-connector" [class.completed]="step > 1"></div>
            <div class="step" [class.active]="step >= 2" [class.completed]="step > 2">
              <div class="step-number">2</div>
              <div class="step-label">Review Quote</div>
            </div>
            <div class="step-connector" [class.completed]="step > 2"></div>
            <div class="step" [class.active]="step >= 3" [class.completed]="step > 3">
              <div class="step-number">3</div>
              <div class="step-label">Payment & Confirmation</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Step 1: Flight Information -->
        <div *ngIf="step === 1" class="step-content">
          <div class="form-card">
            <div class="card-header">
              <h2 class="card-title">
                <div class="card-icon">✈️</div>
                Flight Information
              </h2>
              <p class="card-subtitle">Enter your flight details to calculate emissions and SAF requirements</p>
            </div>

            <form [formGroup]="orderForm" class="order-form">
              <div class="form-grid">
                <!-- Flight Number -->
                <div class="form-group">
                  <label class="form-label" for="flightNumber">
                    Flight Number
                    <span class="required">*</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      id="flightNumber"
                      type="text"
                      formControlName="flightNumber"
                      placeholder="e.g., AA1234"
                      class="form-input"
                      [class.error]="orderForm.get('flightNumber')?.invalid && orderForm.get('flightNumber')?.touched"
                    />
                    <div class="input-icon">🛩️</div>
                  </div>
                  <div class="form-error" *ngIf="orderForm.get('flightNumber')?.invalid && orderForm.get('flightNumber')?.touched">
                    Please enter a valid flight number (e.g., AA1234)
                  </div>
                </div>

                <!-- Flight Date -->
                <div class="form-group">
                  <label class="form-label" for="flightDate">
                    Flight Date
                    <span class="required">*</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      id="flightDate"
                      type="date"
                      formControlName="flightDate"
                      class="form-input"
                      [class.error]="orderForm.get('flightDate')?.invalid && orderForm.get('flightDate')?.touched"
                    />
                    <div class="input-icon">📅</div>
                  </div>
                  <div class="form-error" *ngIf="orderForm.get('flightDate')?.invalid && orderForm.get('flightDate')?.touched">
                    Please select a flight date
                  </div>
                </div>

                <!-- Departure Airport -->
                <div class="form-group">
                  <label class="form-label" for="departureAirport">
                    Departure Airport
                    <span class="required">*</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      id="departureAirport"
                      type="text"
                      formControlName="departureAirport"
                      placeholder="e.g., LAX"
                      class="form-input"
                      [class.error]="orderForm.get('departureAirport')?.invalid && orderForm.get('departureAirport')?.touched"
                    />
                    <div class="input-icon">🛫</div>
                  </div>
                  <div class="form-error" *ngIf="orderForm.get('departureAirport')?.invalid && orderForm.get('departureAirport')?.touched">
                    Please enter a valid 3-letter airport code
                  </div>
                </div>

                <!-- Arrival Airport -->
                <div class="form-group">
                  <label class="form-label" for="arrivalAirport">
                    Arrival Airport
                    <span class="required">*</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      id="arrivalAirport"
                      type="text"
                      formControlName="arrivalAirport"
                      placeholder="e.g., JFK"
                      class="form-input"
                      [class.error]="orderForm.get('arrivalAirport')?.invalid && orderForm.get('arrivalAirport')?.touched"
                    />
                    <div class="input-icon">🛬</div>
                  </div>
                  <div class="form-error" *ngIf="orderForm.get('arrivalAirport')?.invalid && orderForm.get('arrivalAirport')?.touched">
                    Please enter a valid 3-letter airport code
                  </div>
                </div>
              </div>

              <!-- Estimated Emissions Section -->
              <div class="emissions-section" *ngIf="calculatedEmissions || isLoadingEmissions">
                <h3 class="emissions-title">
                  <div class="emissions-icon">🌍</div>
                  Estimated Emissions (kg CO₂)
                </h3>

                <div *ngIf="isLoadingEmissions" class="emissions-loading">
                  <div class="loading-spinner small"></div>
                  <span>Calculating emissions...</span>
                </div>

                <div *ngIf="calculatedEmissions && !isLoadingEmissions" class="emissions-result">
                  <div class="emissions-card">
                    <div class="emissions-value">{{ calculatedEmissions | number:'1.0-0' }} kg CO₂</div>
                    <div class="emissions-description">We'll automatically calculate CO₂ emissions based on your flight details.</div>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="calculateEmissions()"
                  class="calculate-btn"
                  [disabled]="isLoadingEmissions || !orderForm.valid"
                >
                  <span *ngIf="!isLoadingEmissions">🧮 Calculate Emissions</span>
                  <span *ngIf="isLoadingEmissions">⏳ Calculating...</span>
                </button>
              </div>

              <!-- Notes -->
              <div class="form-group full-width">
                <label class="form-label" for="notes">
                  Notes (Optional)
                </label>
                <div class="textarea-wrapper">
                  <textarea
                    id="notes"
                    formControlName="notes"
                    placeholder="Additional information or special requirements..."
                    class="form-textarea"
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <!-- Actions -->
              <div class="form-actions">
                <button type="button" (click)="goToQuote()" class="btn btn-primary" [disabled]="!orderForm.valid">
                  Continue to Quote →
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Step 2: Quote Review -->
        <div *ngIf="step === 2" class="step-content">
          <div class="quote-card">
            <div class="card-header">
              <h2 class="card-title">
                <div class="card-icon">💰</div>
                Review Your Quote
              </h2>
              <p class="card-subtitle">Review your SAF certificate quote and environmental impact</p>
            </div>

            <!-- Loading Quote -->
            <div *ngIf="isLoadingQuote" class="loading-container">
              <div class="loading-content">
                <div class="loading-spinner"></div>
                <p class="loading-text">Calculating your personalized quote...</p>
              </div>
            </div>

            <!-- Quote Details -->
            <div *ngIf="currentQuote && !isLoadingQuote" class="quote-details">
              <!-- Flight Summary -->
              <div class="flight-summary">
                <h3 class="summary-title">Flight Summary</h3>
                <div class="flight-route">
                  <div class="airport">
                    <div class="airport-code">{{ orderForm.value.departureAirport }}</div>
                    <div class="airport-label">Departure</div>
                  </div>
                  <div class="route-connector">
                    <div class="route-line"></div>
                    <div class="route-icon">✈️</div>
                  </div>
                  <div class="airport">
                    <div class="airport-code">{{ orderForm.value.arrivalAirport }}</div>
                    <div class="airport-label">Arrival</div>
                  </div>
                </div>
                <div class="flight-info">
                  <div class="info-item">
                    <span class="info-label">Flight:</span>
                    <span class="info-value">{{ orderForm.value.flightNumber }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Date:</span>
                    <span class="info-value">{{ formatDate(orderForm.value.flightDate) }}</span>
                  </div>
                </div>
              </div>

              <!-- Environmental Impact -->
              <div class="environmental-impact">
                <h3 class="impact-title">🌍 Environmental Impact</h3>
                <div class="impact-grid">
                  <div class="impact-metric">
                    <div class="metric-icon">🛩️</div>
                    <div class="metric-content">
                      <div class="metric-value">{{ currentQuote.recommendedSafVolume | number:'1.2-2' }}L</div>
                      <div class="metric-label">SAF Volume</div>
                    </div>
                  </div>
                  <div class="impact-metric">
                    <div class="metric-icon">🌱</div>
                    <div class="metric-content">
                      <div class="metric-value">{{ currentQuote.carbonReduction | number:'1.0-0' }}kg</div>
                      <div class="metric-label">CO₂ Reduced</div>
                    </div>
                  </div>
                  <div class="impact-metric">
                    <div class="metric-icon">🌍</div>
                    <div class="metric-content">
                      <div class="metric-value">{{ ((currentQuote.carbonReduction / currentQuote.flightEmissions) * 100) | number:'1.0-0' }}%</div>
                      <div class="metric-label">Offset Percentage</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Cost Breakdown -->
              <div class="cost-breakdown">
                <h3 class="cost-title">💰 Cost Breakdown</h3>
                <div class="cost-items">
                  <div class="cost-item">
                    <span class="cost-label">SAF Base Cost</span>
                    <span class="cost-value">{{ formatCurrency(currentQuote.priceBreakdown.baseCost) }}</span>
                  </div>
                  <div class="cost-item">
                    <span class="cost-label">Carbon Credits</span>
                    <span class="cost-value">{{ formatCurrency(currentQuote.priceBreakdown.carbonCredit) }}</span>
                  </div>
                  <div class="cost-item">
                    <span class="cost-label">Processing Fee</span>
                    <span class="cost-value">{{ formatCurrency(currentQuote.priceBreakdown.processingFee) }}</span>
                  </div>
                  <div class="cost-item total">
                    <span class="cost-label">Total Amount</span>
                    <span class="cost-value">{{ formatCurrency(currentQuote.totalPrice) }}</span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="quote-actions">
                <button type="button" (click)="step = 1" class="btn btn-secondary">
                  ← Back to Details
                </button>
                <button
                  type="button"
                  (click)="createOrder()"
                  class="btn btn-primary"
                  [disabled]="isCreatingOrder"
                >
                  <span *ngIf="!isCreatingOrder">Create Order 🚀</span>
                  <span *ngIf="isCreatingOrder">⏳ Creating Order...</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Order Created -->
        <div *ngIf="step === 3" class="step-content">
          <div class="success-card">
            <div class="success-animation">
              <div class="success-icon">🎉</div>
              <div class="success-circles">
                <div class="circle circle-1"></div>
                <div class="circle circle-2"></div>
                <div class="circle circle-3"></div>
              </div>
            </div>

            <h2 class="success-title">Order Created Successfully!</h2>
            <p class="success-description">
              Your SAF certificate order has been placed and is being processed.
              You'll receive a confirmation email shortly.
            </p>

            <div class="success-actions">
              <button (click)="navigateToOrders()" class="btn btn-primary">
                View My Orders
              </button>
              <button (click)="navigateToDashboard()" class="btn btn-secondary">
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="error-container">
          <div class="error-card">
            <div class="error-icon">⚠️</div>
            <div class="error-content">
              <h3 class="error-title">Something went wrong</h3>
              <p class="error-message">{{ error }}</p>
              <button (click)="clearError()" class="retry-btn">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-order-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      position: relative;
      overflow-x: hidden;
    }

    .create-order-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
                  radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%);
      animation: createOrderGlow 15s ease-in-out infinite;
    }

    @keyframes createOrderGlow {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }

    /* Content Wrapper for Layout Consistency */
    .create-order-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0;
      position: relative;
      z-index: 1;
    }

    /* Enhanced Header */
    .create-order-header {
      position: relative;
      max-width: 1400px;
      margin: 2rem auto 2rem;
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
        #3b82f6 0%,
        #2563eb 30%,
        #1d4ed8 60%,
        #1e40af 100%);
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
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
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

    /* Progress Steps */
    .progress-section {
      max-width: 1400px;
      margin: 0 auto 2rem;
    }

    .progress-container {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .progress-steps {
      display: flex;
      align-items: center;
      justify-content: center;
      max-width: 600px;
      margin: 0 auto;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      position: relative;
    }

    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      transition: all 0.3s ease;
    }

    .step.active .step-number {
      background: #3b82f6;
      color: white;
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
    }

    .step.completed .step-number {
      background: var(--primary-green);
      color: white;
      box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
    }

    .step-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.6);
      text-align: center;
      transition: all 0.3s ease;
    }

    .step.active .step-label,
    .step.completed .step-label {
      color: white;
    }

    .step-connector {
      flex: 1;
      height: 2px;
      background: rgba(255, 255, 255, 0.2);
      margin: 0 1rem;
      transition: all 0.3s ease;
    }

    .step-connector.completed {
      background: var(--primary-green);
      box-shadow: 0 0 10px rgba(34, 197, 94, 0.4);
    }

    /* Main Content */
    .main-content {
      max-width: 1400px;
      margin: 0 auto 2rem;
      position: relative;
      z-index: 1;
    }

    .step-content {
      animation: slideIn 0.5s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .form-card, .quote-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .card-header {
      padding: 2rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .card-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a202c;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .card-icon {
      font-size: 1.25rem;
    }

    .card-subtitle {
      color: #64748b;
      font-size: 0.9rem;
      margin: 0;
    }

    /* Form Styles */
    .order-form {
      padding: 2rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .required {
      color: #ef4444;
    }

    .input-wrapper, .textarea-wrapper {
      position: relative;
    }

    .form-input, .form-textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      background: white;
    }

    .form-input:focus, .form-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input.error, .form-textarea.error {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .input-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      opacity: 0.6;
    }

    .form-error {
      font-size: 0.8rem;
      color: #ef4444;
      margin-top: 0.25rem;
    }

    /* Emissions Section */
    .emissions-section {
      background: rgba(34, 197, 94, 0.05);
      border: 1px solid rgba(34, 197, 94, 0.2);
      border-radius: 16px;
      padding: 1.5rem;
      margin: 2rem 0;
    }

    .emissions-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 1rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .emissions-icon {
      font-size: 1.25rem;
    }

    .emissions-loading {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #64748b;
      margin-bottom: 1rem;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(59, 130, 246, 0.2);
      border-top: 3px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-spinner.small {
      width: 20px;
      height: 20px;
      border-width: 2px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .emissions-result {
      margin-bottom: 1rem;
    }

    .emissions-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }

    .emissions-value {
      font-size: 2rem;
      font-weight: 800;
      color: var(--primary-green);
      margin-bottom: 0.5rem;
    }

    .emissions-description {
      color: #64748b;
      font-size: 0.9rem;
    }

    .calculate-btn {
      background: linear-gradient(135deg, var(--primary-green), var(--primary-green-dark));
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .calculate-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .calculate-btn:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
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

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary-green), var(--primary-green-dark));
      color: white;
      box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
    }

    .btn-primary:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(34, 197, 94, 0.4);
    }

    .btn-secondary {
      background: rgba(71, 85, 105, 0.8);
      color: white;
      border: 1px solid rgba(148, 163, 184, 0.5);
      backdrop-filter: blur(10px);
    }

    .btn-secondary:hover {
      background: rgba(71, 85, 105, 1);
      border-color: rgba(148, 163, 184, 0.8);
      transform: translateY(-1px);
    }

    /* Quote Styles */
    .quote-details {
      padding: 2rem;
    }

    .flight-summary {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: rgba(59, 130, 246, 0.05);
      border-radius: 16px;
      border: 1px solid rgba(59, 130, 246, 0.2);
    }

    .summary-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 1rem 0;
    }

    .flight-route {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 1rem;
    }

    .airport {
      text-align: center;
    }

    .airport-code {
      font-size: 1.5rem;
      font-weight: 800;
      color: #1a202c;
    }

    .airport-label {
      font-size: 0.8rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .route-connector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
    }

    .route-line {
      flex: 1;
      height: 2px;
      background: linear-gradient(90deg, #3b82f6, #2563eb);
    }

    .route-icon {
      font-size: 1.25rem;
    }

    .flight-info {
      display: flex;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .info-item {
      display: flex;
      gap: 0.5rem;
    }

    .info-label {
      color: #64748b;
      font-weight: 500;
    }

    .info-value {
      color: #1a202c;
      font-weight: 600;
    }

    /* Environmental Impact */
    .environmental-impact {
      margin-bottom: 2rem;
    }

    .impact-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 1rem 0;
    }

    .impact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .impact-metric {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: rgba(34, 197, 94, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }

    .metric-icon {
      font-size: 1.5rem;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(34, 197, 94, 0.1);
      border-radius: 50%;
    }

    .metric-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1a202c;
    }

    .metric-label {
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 500;
    }

    /* Cost Breakdown */
    .cost-breakdown {
      margin-bottom: 2rem;
    }

    .cost-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 1rem 0;
    }

    .cost-items {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }

    .cost-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .cost-item:last-child {
      border-bottom: none;
    }

    .cost-item.total {
      background: rgba(34, 197, 94, 0.05);
      border-top: 2px solid var(--primary-green);
      font-weight: 700;
    }

    .cost-label {
      color: #64748b;
      font-weight: 500;
    }

    .cost-item.total .cost-label {
      color: #1a202c;
      font-size: 1.1rem;
    }

    .cost-value {
      color: #1a202c;
      font-weight: 600;
    }

    .cost-item.total .cost-value {
      color: var(--primary-green);
      font-size: 1.25rem;
    }

    /* Quote Actions */
    .quote-actions {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    /* Success Card */
    .success-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      padding: 4rem 2rem;
      text-align: center;
      max-width: 500px;
      margin: 0 auto;
    }

    .success-animation {
      position: relative;
      margin-bottom: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .success-icon {
      font-size: 4rem;
      z-index: 2;
      position: relative;
      animation: bounce 2s ease-in-out infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .success-circles {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .circle {
      position: absolute;
      border: 2px solid rgba(34, 197, 94, 0.3);
      border-radius: 50%;
      animation: ripple 3s ease-in-out infinite;
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
      animation-delay: 1s;
    }

    .circle-3 {
      width: 160px;
      height: 160px;
      top: -80px;
      left: -80px;
      animation-delay: 2s;
    }

    @keyframes ripple {
      0% {
        opacity: 1;
        transform: scale(0.8);
      }
      50% {
        opacity: 0.5;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(1.2);
      }
    }

    .success-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1a202c;
      margin: 0 0 1rem 0;
    }

    .success-description {
      color: #64748b;
      margin: 0 0 2rem 0;
      line-height: 1.6;
    }

    .success-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* Error State */
    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 2rem 0;
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

    /* Loading States */
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    }

    .loading-content {
      text-align: center;
      color: #64748b;
    }

    .loading-text {
      margin: 1rem 0 0 0;
      font-size: 0.9rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .create-order-header {
        margin: 1rem 1rem;
      }

      .header-main {
        flex-direction: column;
        text-align: center;
      }

      .progress-section {
        margin: 0 1rem 1.5rem;
      }

      .progress-steps {
        flex-direction: column;
        gap: 1rem;
      }

      .step-connector {
        width: 2px;
        height: 2rem;
        margin: 0;
      }

      .main-content {
        padding: 0 1rem 1rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .flight-route {
        flex-direction: column;
        gap: 1rem;
      }

      .route-connector {
        flex-direction: column;
        height: 3rem;
      }

      .route-line {
        width: 2px;
        height: 100%;
        background: linear-gradient(180deg, #3b82f6, #2563eb);
      }

      .impact-grid {
        grid-template-columns: 1fr;
      }

      .quote-actions {
        flex-direction: column;
      }

      .success-actions {
        flex-direction: column;
      }
    }

    /* CSS Variables */
    :root {
      --primary-green: #22c55e;
      --primary-green-dark: #16a34a;
    }
  `]
})
export class CreateOrderComponent implements OnInit {
  orderForm: FormGroup;
  currentQuote: Quote | null = null;
  calculatedEmissions: number | null = null;
  emissionDetails: any | null = null; // Store full emission data including aircraft type, distance, etc.
  isLoadingQuote = false;
  isLoadingEmissions = false;
  isCreatingOrder = false;
  error = '';
  step = 1; // 1: Flight Details, 2: Quote Review, 3: Order Creation

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private router: Router,
    private errorService: ErrorService
  ) {
    this.orderForm = this.fb.group({
      flightNumber: ['', [Validators.required, Validators.pattern(/^[A-Z]{2,3}[0-9]{1,4}$/)]],
      departureAirport: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}$/)]],
      arrivalAirport: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}$/)]],
      flightDate: ['', [Validators.required]],
      notes: ['']
    });
  }

  ngOnInit() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const flightDateControl = this.orderForm.get('flightDate');
    if (flightDateControl) {
      flightDateControl.setValue(today);
    }

    // Listen for form changes to auto-calculate emissions
    this.orderForm.valueChanges.subscribe(() => {
      this.calculatedEmissions = null;
      this.emissionDetails = null;
    });
  }

  calculateEmissions() {
    const flightNumber = this.orderForm.get('flightNumber')?.value;
    const departureAirport = this.orderForm.get('departureAirport')?.value;
    const arrivalAirport = this.orderForm.get('arrivalAirport')?.value;

    if (flightNumber && departureAirport && arrivalAirport) {
      this.isLoadingEmissions = true;
      this.error = '';

      this.orderService.getFlightEmissions(flightNumber, departureAirport, arrivalAirport).subscribe({
        next: (emissionData: any) => {
          this.emissionDetails = emissionData;
          this.calculatedEmissions = emissionData.co2Emissions || emissionData.totalEmissions;
          this.isLoadingEmissions = false;
        },
        error: (error: any) => {
          this.error = 'Unable to calculate emissions automatically. Please check flight details.';
          this.errorService.showApiError(error);
          this.isLoadingEmissions = false;
        }
      });
    }
  }

  onGetQuote() {
    // First calculate emissions if not already done
    if (!this.calculatedEmissions && this.isValidFlightInfo()) {
      this.calculateEmissions();
      // Wait for emissions calculation before proceeding
      const emissionsSubscription = this.orderService.getFlightEmissions(
        this.orderForm.value.flightNumber,
        this.orderForm.value.departureAirport,
        this.orderForm.value.arrivalAirport
      ).subscribe({
        next: (emissionData: any) => {
          this.emissionDetails = emissionData;
          this.calculatedEmissions = emissionData.co2Emissions || emissionData.totalEmissions;
          this.proceedWithQuote();
          emissionsSubscription.unsubscribe();
        },
        error: (error: any) => {
          this.error = 'Unable to calculate emissions. Please check flight details.';
          this.errorService.showApiError(error);
          this.isLoadingQuote = false;
        }
      });
    } else if (this.calculatedEmissions) {
      this.proceedWithQuote();
    }
  }

  isValidFlightInfo(): boolean {
    const flightNumber = this.orderForm.get('flightNumber')?.value;
    const departureAirport = this.orderForm.get('departureAirport')?.value;
    const arrivalAirport = this.orderForm.get('arrivalAirport')?.value;

    return !!(flightNumber && departureAirport && arrivalAirport);
  }

  private proceedWithQuote() {
    if (this.orderForm.valid && this.calculatedEmissions) {
      this.isLoadingQuote = true;
      this.error = '';

      const quoteRequest: QuoteRequest = {
        flightNumber: this.orderForm.value.flightNumber,
        departureAirport: this.orderForm.value.departureAirport,
        arrivalAirport: this.orderForm.value.arrivalAirport,
        flightDate: this.orderForm.value.flightDate,
        estimatedEmissions: this.calculatedEmissions
      };

      this.orderService.getQuote(quoteRequest).subscribe({
        next: (quote: Quote) => {
          this.currentQuote = quote;
          this.step = 2;
          this.isLoadingQuote = false;
        },
        error: (error: any) => {
          this.error = error.error?.message || 'Failed to get quote. Please try again.';
          this.errorService.showApiError(error);
          this.isLoadingQuote = false;
        }
      });
    }
  }

  onCreateOrder() {
    if (this.orderForm.valid && this.currentQuote && this.calculatedEmissions) {
      this.isCreatingOrder = true;
      this.error = '';

      const orderRequest: OrderRequest = {
        userEmail: '', // This will be filled by the backend from the auth token
        flightNumber: this.orderForm.value.flightNumber,
        departureAirport: this.orderForm.value.departureAirport,
        arrivalAirport: this.orderForm.value.arrivalAirport,
        flightDate: this.orderForm.value.flightDate,
        flightEmissions: this.calculatedEmissions,
        safVolume: this.currentQuote.recommendedSafVolume,
        priceUsd: this.currentQuote.totalPrice
      };

      this.orderService.createOrder(orderRequest).subscribe({
        next: (order) => {
          this.isCreatingOrder = false;
          this.errorService.showSuccess('Order created! Redirecting to payment... 💳');

          // Redirect to payment checkout instead of showing success
          this.router.navigate(['/payment/checkout', order.id]);
        },
        error: (error: any) => {
          this.error = error.error?.message || 'Failed to create order. Please try again.';
          this.errorService.showApiError(error);
          this.isCreatingOrder = false;
        }
      });
    }
  }

  onBackToFlightDetails() {
    this.step = 1;
    this.currentQuote = null;
    this.error = '';
  }

  onGoToOrders() {
    this.router.navigate(['/orders']);
  }

  onCreateAnother() {
    this.step = 1;
    this.currentQuote = null;
    this.error = '';
    this.orderForm.reset();

    // Reset date to today
    const today = new Date().toISOString().split('T')[0];
    this.orderForm.get('flightDate')?.setValue(today);
  }

  getFieldError(fieldName: string): string {
    const field = this.orderForm.get(fieldName);

    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['pattern']) {
        if (fieldName === 'flightNumber') return 'Flight number must be in format like AA1234';
        if (fieldName === 'departureAirport' || fieldName === 'arrivalAirport') {
          return 'Airport code must be 3 letters (e.g., LAX)';
        }
      }
      if (field.errors['min']) return `${this.getFieldLabel(fieldName)} must be greater than 0`;
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      flightNumber: 'Flight number',
      departureAirport: 'Departure airport',
      arrivalAirport: 'Arrival airport',
      flightDate: 'Flight date',
      estimatedEmissions: 'Estimated emissions'
    };
    return labels[fieldName] || fieldName;
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

  formatCalculationTime(timestamp: string): string {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateSavingsPercentage(): number {
    if (!this.currentQuote) return 0;
    return Math.round((this.currentQuote.carbonReduction / this.currentQuote.flightEmissions) * 100);
  }

  // Additional methods for the new template
  goToQuote() {
    this.onGetQuote();
  }

  createOrder() {
    this.onCreateOrder();
  }

  clearError() {
    this.error = '';
  }

  navigateToOrders() {
    this.router.navigate(['/orders']);
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
