// src/app/core/services/contract.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contract, ContractCreateDTO, ContractStatus } from '../models/contract.model';

export type { Contract, ContractStatus };


@Injectable({
  providedIn: 'root',
})
export class ContractService {


  private baseUrl = 'http://localhost:8080/contracts';

  constructor(private http: HttpClient) {}


  getAll(): Observable<Contract[]> {
    return this.http.get<Contract[]>(this.baseUrl);
  }


  getById(id: number): Observable<Contract> {
    return this.http.get<Contract>(`${this.baseUrl}/${id}`);
  }


  getByClientId(clientId: number): Observable<Contract[]> {
    return this.http.get<Contract[]>(`${this.baseUrl}/client/${clientId}`);
  }


  getContratsActifs(): Observable<Contract[]> {
    return this.http.get<Contract[]>(`${this.baseUrl}/actifs`);
  }


  create(contract: ContractCreateDTO): Observable<Contract> {
    return this.http.post<Contract>(`${this.baseUrl}/create`, contract);
  }


  cancel(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/cancel`, {});
  }
}
