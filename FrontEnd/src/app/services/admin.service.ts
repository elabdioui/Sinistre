import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  // ✅ MODIFIÉ: URL relative
  private readonly baseUrl = '/admin';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.baseUrl}/dashboard`);
  }

  getServicesStatus(): Observable<ServicesStatus> {
    return this.http.get<ServicesStatus>(`${this.baseUrl}/services/status`);
  }
}
