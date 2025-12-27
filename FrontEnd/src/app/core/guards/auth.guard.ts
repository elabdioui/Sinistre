import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    // Vérifier si le token n'est pas expiré (optionnel)
    return true;
  }

  // Rediriger vers login en conservant l'URL demandée
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};
