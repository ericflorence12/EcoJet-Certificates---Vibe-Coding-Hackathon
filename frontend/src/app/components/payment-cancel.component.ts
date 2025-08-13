import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <!-- Cancel Icon -->
          <div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-orange-100 mb-6">
            <svg class="h-12 w-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>

          <!-- Cancel Message -->
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
          <p class="text-gray-600 mb-8">
            Your payment was cancelled. No charges have been made to your account.
          </p>

          <!-- Information Box -->
          <div class="bg-orange-50 rounded-lg p-6 mb-6">
            <h3 class="text-lg font-semibold text-orange-900 mb-3">What happened?</h3>
            <div class="text-sm text-orange-800 space-y-2">
              <p>• You chose to cancel the payment process</p>
              <p>• Your order is still pending and can be paid for later</p>
              <p>• No payment has been processed</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-4">
            <button
              routerLink="/orders"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              Return to Orders
            </button>

            <button
              routerLink="/orders/create"
              class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors">
              Create New Order
            </button>

            <button
              routerLink="/dashboard"
              class="w-full text-blue-600 hover:text-blue-700 font-medium py-2 transition-colors">
              Back to Dashboard
            </button>
          </div>

          <!-- Help Section -->
          <div class="bg-gray-50 rounded-lg p-4 mt-6">
            <h4 class="text-sm font-semibold text-gray-900 mb-2">Need Help?</h4>
            <p class="text-sm text-gray-600 mb-3">
              If you encountered any issues during the payment process, please contact our support team.
            </p>
            <button class="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Contact Support
            </button>
          </div>

          <!-- Retry Information -->
          <div class="bg-blue-50 rounded-lg p-4 mt-4">
            <h4 class="text-sm font-semibold text-blue-900 mb-2">Ready to try again?</h4>
            <p class="text-sm text-blue-800">
              You can complete your payment at any time by going to your orders page and selecting the pending order.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentCancelComponent {
  constructor() {}
}
