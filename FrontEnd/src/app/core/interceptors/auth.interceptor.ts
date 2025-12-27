// src/app/core/interceptors/auth.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  // Récupérer les données utilisateur stockées (depuis les clés individuelles)
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  // Log pour debug
  console.log('🔐 Auth Interceptor - User:', { userId, userRole, hasToken: !!token });

  // Ajouter le token et les headers RBAC aux requêtes si disponibles
  if (token) {
    const headers: { [key: string]: string } = {
      'Authorization': `Bearer ${token}`
    };

    // Ajouter les headers RBAC si disponibles
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    if (userRole) {
      headers['X-User-Role'] = userRole;
    }

    // Log pour debug
    console.log('📤 Request headers:', headers);

    req = req.clone({
      setHeaders: headers
    });
  } else {
    // ⚠️ Pas de token - utilisateur non connecté
    console.warn('⚠️ Aucun token trouvé pour la requête:', req.url);
  }

  return next(req).pipe(
    catchError((error) => {
      // Si erreur 401, déconnecter l'utilisateur
      if (error.status === 401) {
        console.error('🔒 Erreur 401 - Non autorisé, redirection vers login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/login']);
      }

      // Si erreur 403, afficher un message détaillé
      if (error.status === 403) {
        console.error('🚫 Erreur 403 - Accès refusé:', {
          url: req.url,
          userRole: userRole,
          message: error.error
        });

        // ✅ Optionnel : Afficher un toast/notification à l'utilisateur
        // this.toastr.error('Vous n\'avez pas les permissions nécessaires');
      }

      return throwError(() => error);
    })
  );
};
