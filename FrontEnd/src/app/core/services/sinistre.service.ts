import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Sinistre, StatutSinistre, CreateSinistreDTO, UpdateStatutDTO } from '../../shared/models/sinistre.model';

@Injectable({
  providedIn: 'root',
})
export class SinistreService {
  private readonly baseUrl = 'http://localhost:8080/sinistres';

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les sinistres
   */
  getAll(): Observable<Sinistre[]> {
    return this.http.get<Sinistre[]>(this.baseUrl).pipe(
      tap(data => console.log('Sinistres récupérés:', data)),
      catchError(this.handleError)
    );
  }

  /**
   * Récupérer un sinistre par ID
   */
  getById(id: number): Observable<Sinistre> {
    return this.http.get<Sinistre>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupérer les sinistres d'un client
   */
  getByClientId(clientId: number): Observable<Sinistre[]> {
    return this.http.get<Sinistre[]>(`${this.baseUrl}/client/${clientId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupérer les sinistres d'un contrat
   */
  getByContratId(contratId: number): Observable<Sinistre[]> {
    return this.http.get<Sinistre[]>(`${this.baseUrl}/contrat/${contratId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Créer un nouveau sinistre
   */
  create(sinistre: CreateSinistreDTO): Observable<Sinistre> {
    return this.http.post<Sinistre>(this.baseUrl, sinistre).pipe(
      tap(data => console.log('Sinistre créé:', data)),
      catchError(this.handleError)
    );
  }

  /**
   * Mettre à jour le statut d'un sinistre
   */
  updateStatut(id: number, data: UpdateStatutDTO): Observable<Sinistre> {
    return this.http.put<Sinistre>(`${this.baseUrl}/${id}/statut`, data).pipe(
      tap(result => console.log('Statut mis à jour:', result)),
      catchError(this.handleError)
    );
  }

  /**
   * Mettre à jour un sinistre complet
   */
  update(id: number, sinistre: Partial<Sinistre>): Observable<Sinistre> {
    return this.http.put<Sinistre>(`${this.baseUrl}/${id}`, sinistre).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Supprimer un sinistre
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Gestion centralisée des erreurs
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      // Si le backend renvoie un message string, l'utiliser
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        switch (error.status) {
          case 0:
            errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
            break;
          case 400:
            errorMessage = 'Données invalides. Vérifiez votre saisie.';
            break;
          case 401:
            errorMessage = 'Non autorisé. Veuillez vous reconnecter.';
            break;
          case 403:
            errorMessage = 'Accès refusé. Vous n\'avez pas les droits nécessaires.';
            break;
          case 404:
            errorMessage = 'Ressource non trouvée.';
            break;
          case 500:
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
            break;
          default:
            errorMessage = `Erreur ${error.status}: ${error.message}`;
        }
      }
    }

    console.error('Erreur HTTP complète:', error);
    console.error('Message d\'erreur:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
