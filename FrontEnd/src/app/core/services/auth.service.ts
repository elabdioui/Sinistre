import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, switchMap, map } from 'rxjs/operators';

interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  role: string;
  username?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('🔑 AuthService - Réponse login complète:', response);
        console.log('🔑 Type:', typeof response);
        console.log('🔑 JSON:', JSON.stringify(response, null, 2));
        console.log('🔑 Clés disponibles:', Object.keys(response || {}));
        console.log('🔍 response.userId =', response.userId, '(type:', typeof response.userId, ')');
        console.log('🔍 response["userId"] =', response["userId"]);

        // Vérifier si userId existe sous un autre nom
        console.log('🔍 Recherche de propriétés contenant "id"...');
        Object.keys(response || {}).forEach(key => {
          if (key.toLowerCase().includes('id')) {
            console.log(`   - ${key}: ${(response as any)[key]}`);
          }
        });

        if (!response || !response.token) {
          console.error('❌ Réponse invalide !');
          throw new Error('Réponse du serveur invalide');
        }

        // Stocker le token
        console.log('✅ Token trouvé');
        localStorage.setItem('token', response.token);

        // Stocker username, email, role
        if (response.username) {
          localStorage.setItem('username', response.username);
          console.log('✅ Username stocké:', response.username);
        }

        if (response.email) {
          localStorage.setItem('userEmail', response.email);
          console.log('✅ Email stocké:', response.email);
        }

        if (response.role) {
          localStorage.setItem('userRole', response.role);
          console.log('✅ Role stocké:', response.role);
        }

        // Si userId présent dans la réponse, le stocker directement
        if (response.userId !== undefined && response.userId !== null) {
          localStorage.setItem('userId', response.userId.toString());
          console.log('✅ UserId stocké directement:', response.userId);
        } else {
          console.warn('⚠️ userId manquant dans la réponse - Extraction du token JWT');

          // Extraire userId du token JWT (payload)
          try {
            const tokenParts = response.token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log('🔍 JWT Payload:', payload);

              if (payload.userId) {
                localStorage.setItem('userId', payload.userId.toString());
                console.log('✅ UserId extrait du JWT:', payload.userId);
              } else {
                console.error('❌ userId introuvable même dans le JWT !');
              }
            }
          } catch (e) {
            console.error('❌ Erreur lors du décodage du JWT:', e);
          }
        }

        console.log('💾 Données stockées:', {
          token: '✅',
          userId: localStorage.getItem('userId') || '❌ MANQUANT',
          userRole: localStorage.getItem('userRole') || '❌',
          userEmail: localStorage.getItem('userEmail') || '❌',
          username: localStorage.getItem('username') || '❌'
        });
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
  }

  /**
   * Récupérer l'ID de l'utilisateur connecté
   */
  getCurrentUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  }

  /**
   * Récupérer le rôle de l'utilisateur connecté
   */
  getCurrentUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  /**
   * Vérifier si l'utilisateur est un CLIENT
   */
  isClient(): boolean {
    return this.getCurrentUserRole() === 'CLIENT';
  }

  /**
   * Vérifier si l'utilisateur est un GESTIONNAIRE
   */
  isGestionnaire(): boolean {
    return this.getCurrentUserRole() === 'GESTIONNAIRE';
  }

  /**
   * Vérifier si l'utilisateur est un ADMIN
   */
  isAdmin(): boolean {
    return this.getCurrentUserRole() === 'ADMIN';
  }
}
