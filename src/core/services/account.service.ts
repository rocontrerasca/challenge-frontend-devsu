import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AccountCreateDto,
  AccountUpdateDto,
  AccountResponseDto,
} from '../models/account';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly base = `${environment.apiBase}/account`;

  constructor(private http: HttpClient) {}

  // SIEMPRE trae todas las cuentas (sin filtros)
  listAll(): Observable<ApiResponse<AccountResponseDto[]>> {
    return this.http.get<ApiResponse<AccountResponseDto[]>>(this.base);
  }

  create(dto: AccountCreateDto): Observable<ApiResponse<AccountResponseDto>> {
    return this.http.post<ApiResponse<AccountResponseDto>>(this.base, dto);
  }

  // PUT /account con el body de actualización
  update(dto: AccountUpdateDto): Observable<ApiResponse<AccountUpdateDto>> {
    return this.http.put<ApiResponse<AccountUpdateDto>>(this.base, dto);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/${id}`);
  }

  listByClient(clientId: string) {
    return this.http.get<ApiResponse<AccountResponseDto[]>>(
      `${this.base}/client/${clientId}`
    );
  }
}
