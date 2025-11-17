import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductsComponent } from './pages/products/products.component';


import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: 'login',component: LoginComponent},
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard]},
  { path: 'products', component: ProductsComponent, canActivate: [authGuard] },

  // aquí luego agregamos las rutas protegidas del admin
];
