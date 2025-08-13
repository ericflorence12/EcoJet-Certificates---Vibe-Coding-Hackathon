import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PaymentService } from '../services/payment.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <!-- Success Icon -->
          <div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
            <svg class="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          <!-- Success Message -->
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p class="text-gray-600 mb-8">
            Your payment has been processed successfully. You will receive a confirmation email shortly.
          </p>

          <!-- Payment Details -->
          <div class="bg-white rounded-lg shadow p-6 mb-6" *ngIf="paymentDetails">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Payment ID:</span>
                <span class="font-medium text-gray-900">{{ paymentDetails.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Amount:</span>
                <span class="font-medium text-gray-900">{{ paymentService.formatAmount(paymentDetails.amount) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Order ID:</span>
                <span class="font-medium text-gray-900">{{ paymentDetails.orderId }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Status:</span>
                <span class="font-medium text-green-600">{{ paymentService.getStatusText(paymentDetails.status) }}</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-4">
            <button
              routerLink="/certificates"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              View Your Certificates
            </button>

            <button
              routerLink="/orders"
              class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors">
              View All Orders
            </button>

            <button
              routerLink="/dashboard"
              class="w-full text-blue-600 hover:text-blue-700 font-medium py-2 transition-colors">
              Back to Dashboard
            </button>
          </div>

          <!-- Next Steps -->
          <div class="bg-blue-50 rounded-lg p-4 mt-6">
            <h4 class="text-sm font-semibold text-blue-900 mb-2">What's Next?</h4>
            <ul class="text-sm text-blue-800 space-y-1">
              <li>• Your SAF certificate will be generated and emailed to you</li>
              <li>• You can track your environmental impact in the dashboard</li>
              <li>• Download your certificate PDF from the certificates page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentSuccessComponent implements OnInit {
  paymentDetails: any = null;
  isLoading = true;

  constructor(
    public paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkPaymentStatus();
  }

  private checkPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      this.paymentService.confirmPayment(sessionId).subscribe({
        next: (response) => {
          if (response.success) {
            this.paymentDetails = response.data;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching payment details:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }
}
