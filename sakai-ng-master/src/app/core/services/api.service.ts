import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '@shared/models/common.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private readonly http = inject(HttpClient);
    private readonly base = environment.apiUrl;

    get<T>(path: string, params?: Record<string, string | number>): Observable<ApiResponse<T>> {
        return this.http.get<ApiResponse<T>>(`${this.base}${path}`, {
            params: params ? new HttpParams({ fromObject: params as Record<string, string> }) : undefined
        });
    }

    getPaginated<T>(path: string, params?: Record<string, string | number>): Observable<PaginatedResponse<T>> {
        return this.http.get<PaginatedResponse<T>>(`${this.base}${path}`, {
            params: params ? new HttpParams({ fromObject: params as Record<string, string> }) : undefined
        });
    }

    post<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
        return this.http.post<ApiResponse<T>>(`${this.base}${path}`, body);
    }

    put<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
        return this.http.put<ApiResponse<T>>(`${this.base}${path}`, body);
    }

    patch<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
        return this.http.patch<ApiResponse<T>>(`${this.base}${path}`, body);
    }

    delete<T>(path: string): Observable<ApiResponse<T>> {
        return this.http.delete<ApiResponse<T>>(`${this.base}${path}`);
    }
}
