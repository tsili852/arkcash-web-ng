import { Routes } from '@angular/router';

import { LoginComponent } from './authentication/login/login.component';

import { AuthGuard } from './utils/auth.guard';

export const authProviders = [AuthGuard];

export const routes: Routes = [
  { path: '', redirectTo: 'main/default', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'main',
    loadChildren: () => import('./main/main.module').then((mod) => mod.MainModule),
    canActivate: authProviders
  }
];

export const navigatableComponents = [LoginComponent];
