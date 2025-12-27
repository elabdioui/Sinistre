import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  message = '';
  isError = false;

  // 👉 variable pour afficher le JWT
  jwtToken: string | null = null;
  private returnUrl: string = '/admin/dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Récupérer l'URL de retour si elle existe
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';

    // Rediriger si déjà connecté
    if (localStorage.getItem('token')) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit() {
    this.message = '';
    this.isError = false;
    this.jwtToken = null;

    console.log('🔐 Tentative de connexion avec:', {
      username: this.credentials.username,
      passwordLength: this.credentials.password.length
    });

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        // Le AuthService gère déjà le stockage via tap()
        // Pas besoin de dupliquer ici

        console.log('✅ Connexion réussie:', {
          userId: response.userId,
          email: response.email,
          role: response.role,
          username: response.username
        });

        // 👉 on le met aussi dans une variable pour l'afficher
        this.jwtToken = response.token;

        this.isError = false;
        this.message = 'Connexion réussie ✅';

        // Redirection basée sur le rôle
        const userRole = response.role;
        let redirectPath = this.returnUrl;

        // Si pas d'URL de retour spécifique, rediriger selon le rôle
        if (this.returnUrl === '/admin/dashboard') {
          if (userRole === 'CLIENT') {
            redirectPath = '/admin/contracts'; // Client voit ses contrats
          } else if (userRole === 'GESTIONNAIRE' || userRole === 'ADMIN') {
            redirectPath = '/admin/dashboard'; // Admin/Gestionnaire vers dashboard
          }
        }

        console.log('🚀 Redirection vers:', redirectPath);

        // Navigation immédiate après que le token soit stocké
        this.router.navigate([redirectPath]).then(
          success => console.log('✅ Navigation réussie:', success),
          error => console.error('❌ Erreur navigation:', error)
        );
      },
      error: (err) => {
        console.error('❌ LOGIN ERROR - Objet complet:', err);
        console.error('❌ LOGIN ERROR - Détails:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message,
          url: err.url,
          name: err.name,
          headers: err.headers
        });
        this.isError = true;

        // Message d'erreur plus détaillé
        if (err.status === 401) {
          this.message = '🔒 Identifiants incorrects. Vérifie ton username et mot de passe.';
        } else if (err.status === 0 || err.status === undefined) {
          this.message = '🚫 Impossible de contacter le serveur. Problème CORS ou backend non démarré. Vérifie la console (F12).';
        } else if (err.status === 403) {
          this.message = '⛔ Accès interdit par le serveur (403).';
        } else if (err.status >= 500) {
          this.message = `💥 Erreur serveur (${err.status}). Vérifie les logs du backend.`;
        } else {
          const errorMsg = err.error?.message || err.message || 'Erreur inconnue';
          this.message = `❌ Erreur: ${errorMsg}`;
        }
      }
    });
  }
}
