import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { ContractsListComponent } from './features/contracts/contracts-list/contracts-list.component';
import { SinistresListComponent } from './features/sinistres/sinistres-list/sinistres-list.component';
import { CreateSinistreComponent } from './features/sinistres/create-sinistre/create-sinistre.component';
import { BackendHealthComponent } from './features/admin/backend-health/backend-health.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Redirection de la racine vers le dashboard si connecté, sinon vers login
  {
    path: '',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full'
  },

  // Routes d'authentification (publiques)
  {
    path: 'login',
    component: LoginComponent,
    title: 'Connexion - Sinistre Manager'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Inscription - Sinistre Manager'
  },

  // Routes d'administration (protégées)
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        title: 'Dashboard - Sinistre Manager'
      },
      {
        path: 'contracts',
        component: ContractsListComponent,
        title: 'Contrats - Sinistre Manager'
      },
      {
        path: 'sinistres',
        component: SinistresListComponent,
        title: 'Sinistres - Sinistre Manager'
      },
      {
        path: 'health',
        component: BackendHealthComponent,
        title: 'État des Services - Sinistre Manager'
      }
    ]
  },

  // Routes des sinistres (protégées)
  {
    path: 'sinistres',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: SinistresListComponent,
        title: 'Liste des Sinistres - Sinistre Manager'
      },
      {
        path: 'create',
        component: CreateSinistreComponent,
        title: 'Nouveau Sinistre - Sinistre Manager'
      }
    ]
  },

  // Route wildcard - rediriger vers dashboard si connecté, sinon vers login
  {
    path: '**',
    redirectTo: 'admin/dashboard'
  }
];
