import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders/orders.component').then(m => m.OrdersComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'orders/create',
    loadComponent: () => import('./create-order/create-order.component').then(m => m.CreateOrderComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'certificates',
    loadComponent: () => import('./certificates/certificates.component').then(m => m.CertificatesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'docs',
    loadComponent: () => import('./docs/docs.component').then(m => m.DocsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'payment',
    children: [
      {
        path: 'checkout/:orderId',
        loadComponent: () => import('./components/payment-checkout.component').then(m => m.PaymentCheckoutComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'success',
        loadComponent: () => import('./components/payment-success.component').then(m => m.PaymentSuccessComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'cancel',
        loadComponent: () => import('./components/payment-cancel.component').then(m => m.PaymentCancelComponent),
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
