import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MoveCreateDto, MoveResponseDto } from '../models/move';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';
import { MoveReportRow } from '../models/report';

@Injectable({ providedIn: 'root' })
export class MoveService {
  private readonly base = `${environment.apiBase}/move`;

  constructor(private http: HttpClient) { }

  listAll(): Observable<ApiResponse<MoveResponseDto[]>> {
    return this.http.get<ApiResponse<MoveResponseDto[]>>(this.base);
  }

  create(dto: MoveCreateDto): Observable<ApiResponse<MoveResponseDto>> {
    return this.http.post<ApiResponse<MoveResponseDto>>(this.base, dto);
  }

  report(startDateISO: string, endDateISO: string, clientId: string) {
    const body = { startDate: startDateISO, endDate: endDateISO, clientId };
    return this.http.post<ApiResponse<MoveReportRow[]>>(`${this.base}/report`, body )
  }

  reportPdf(startDateISO: string, endDateISO: string, clientId: string) {
    const body = { startDate: startDateISO, endDate: endDateISO, clientId };
    return this.http.post<ApiResponse<any>>(`${this.base}/report/pdf`, body )
  }
}
