// src/app/services/sinistre.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sinistre, CreateSinistreDTO, UpdateStatutDTO, StatutSinistre } from '../shared/models/sinistre.model';

@Injectable({
  providedIn: 'root',
})
export class SinistreService {
  
  private readonly baseUrl = 'http://localhost:8080/sinistres';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Sinistre[]> {
    return this.http.get<Sinistre[]>(this.baseUrl);
  }


  getById(id: number): Observable<Sinistre> {
    return this.http.get<Sinistre>(`${this.baseUrl}/${id}`);
  }


  getByClientId(clientId: number): Observable<Sinistre[]> {
    return this.http.get<Sinistre[]>(`${this.baseUrl}/client/${clientId}`);
  }


  getByContratId(contratId: number): Observable<Sinistre[]> {
    return this.http.get<Sinistre[]>(`${this.baseUrl}/contrat/${contratId}`);
  }


  create(sinistre: CreateSinistreDTO): Observable<Sinistre> {
    return this.http.post<Sinistre>(this.baseUrl, sinistre);
  }


  updateStatut(id: number, data: UpdateStatutDTO): Observable<Sinistre> {
    return this.http.put<Sinistre>(`${this.baseUrl}/${id}/statut`, data);
  }


  passerEnCours(id: number): Observable<Sinistre> {
    return this.updateStatut(id, { statut: StatutSinistre.EN_COURS });
  }


  valider(id: number, montantApprouve: number): Observable<Sinistre> {
    return this.updateStatut(id, {
      statut: StatutSinistre.VALIDE,
      montantApprouve
    });
  }


  rejeter(id: number): Observable<Sinistre> {
    return this.updateStatut(id, {
      statut: StatutSinistre.REJETE
    });
  }


  indemniser(id: number): Observable<Sinistre> {
    return this.updateStatut(id, {
      statut: StatutSinistre.INDEMNISE
    });
  }


  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
