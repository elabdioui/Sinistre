// src/app/core/services/user.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  username: string;
  nom?: string;
  prenom?: string;
  email: string;
  role: 'CLIENT' | 'GESTIONNAIRE' | 'ADMIN';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // URL du backend
  private readonly baseUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {}

  /**
   * GET /auth/users - Tous les utilisateurs
   */
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  /**
   * GET /auth/clients - Tous les clients (users avec role CLIENT)
   */
  getAllClients(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/clients`);
  }

  /**
   * GET /auth/users/{id} - Un utilisateur par ID
   */
  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`);
  }
}
