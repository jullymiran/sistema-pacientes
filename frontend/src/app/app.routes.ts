import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { Login } from './pages/login/login';
import { Pacientes } from './pages/pacientes/pacientes';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'pacientes', component: Pacientes, canActivate: [authGuard] },
  { path: '', redirectTo: 'pacientes', pathMatch: 'full' },
  { path: '**', redirectTo: 'pacientes' },
];