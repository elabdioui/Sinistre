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

  // ✅ MODIFIÉ: URL relative (le proxy nginx redirigera vers api-gateway)
  private apiUrl = '/auth';

  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('🔑 AuthService - Réponse login complète:', response);

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
        }

        if (response.email) {
          localStorage.setItem('userEmail', response.email);
        }

        if (response.role) {
          localStorage.setItem('userRole', response.role);
        }

        // Si userId présent dans la réponse, le stocker directement
        if (response.userId !== undefined && response.userId !== null) {
          localStorage.setItem('userId', response.userId.toString());
          console.log('✅ UserId stocké:', response.userId);
        } else {
          console.warn('⚠️ userId manquant dans la réponse - Extraction du token JWT');

          // Extraire userId du token JWT (payload)
          try {
            const tokenParts = response.token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              if (payload.userId) {
                localStorage.setItem('userId', payload.userId.toString());
                console.log('✅ UserId extrait du JWT:', payload.userId);
              }
            }
          } catch (e) {
            console.error('❌ Erreur extraction userId du JWT:', e);
          }
        }
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUser(): any {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  getUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
  }
}
