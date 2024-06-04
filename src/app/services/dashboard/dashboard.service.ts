import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ResponseI } from '../../interfaces/response.interface';
import { catchError, map } from 'rxjs';
import { DashboardI } from '../../interfaces/dashboard.interface';
import { handleError } from '../../tools/tools';
import { UsuarioI } from '../../interfaces/user-token.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private readonly http: HttpClient) {}

  private url = environment.url;

  getDashboard(params: HttpParams) {
    return this.http.get<ResponseI>(this.url, { params }).pipe(
      map((data) => data.result as DashboardI),
      catchError((e) => handleError(e))
    );
  }

  getInformeData(params: HttpParams) {
    const direction = `${this.url}informes/usuarios/informes`;
    return this.http.get<ResponseI>(direction, { params }).pipe(
      catchError((e) => handleError(e)),
      map((data) => data.result as { count: number; data: UsuarioI[] })
    );
  }
}
