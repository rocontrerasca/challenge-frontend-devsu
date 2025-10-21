import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientCreateDto, ClientResponseDto, ClientUpdateDto } from '../models/client';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly base = environment.apiBase;
  constructor(private http: HttpClient) {}
  getAll(): Observable<ApiResponse<ClientResponseDto[]>> {
    return this.http.get<ApiResponse<ClientResponseDto[]>>(`${this.base}/client`);
  }
  create(dto: ClientCreateDto): Observable<void> {
    return this.http.post<void>(`${this.base}/client`, dto);
  }

  update(id: string, dto: ClientUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.base}/client`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/client/${id}`);
  }
}
