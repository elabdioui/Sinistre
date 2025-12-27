import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// adapte ces interfaces si tu as déjà tes models
export interface Dashboard {
  totalClients: number;
  totalSinistres: number;
  sinistresEnAttente: number;
  sinistresValides: number;
  message: string;
}

export interface ServicesStatus {
  assurance: string;
  sinistre: string;
  auth: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  // URL du GATEWAY vers le microservice admin
  private readonly baseUrl = 'http://localhost:8080/admin';

  constructor(private http: HttpClient) {}

  /** GET /admin/dashboard */
  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.baseUrl}/dashboard`);
  }

  /** GET /admin/services/status */
  getServicesStatus(): Observable<ServicesStatus> {
    return this.http.get<ServicesStatus>(`${this.baseUrl}/services/status`);
  }
}
