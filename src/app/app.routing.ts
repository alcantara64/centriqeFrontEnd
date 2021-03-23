/** 18112020 - Gaurav - Init version: App routing module with useHash set to true. Show Login page, by default
 * 19112020 - Gaurav - Added lazy-load dash feature module route */
/** 20112020 - Gaurav - Auth guard to prevent unauthenticated access to dashboard routes.
 * Login guard to prevent authenticated user to go to login screen, unless logout.
 * Alternative could be CanDeactivate on dashboard when authenticated, keeping it simple though */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './auth/auth-guard.service';
import { LoginGuardService } from './auth/login/login-guard.service';
import { LoginComponent } from './auth/login/login.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuardService],
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
    canActivate: [AuthGuardService],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  // { path: '**', redirectTo: '/login'}, pagenotfound component - route to login or dashboard based on persisted session/authentication status
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
