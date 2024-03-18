import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ResponseI } from '../../interfaces/response.interface';
import { catchError, map } from 'rxjs';
import { UsuarioI } from '../../interfaces/user-token.interface';
import { handleError } from '../../tools/tools';

@Injectable({
  providedIn: 'root',
})
export class AsesorService {
  constructor(private readonly http: HttpClient) {}

  url = `${environment.url}users`;

  getAllFilter(params: HttpParams) {
    return this.http.get<ResponseI>(this.url, { params }).pipe(
      map((data) => data.result as { entities: UsuarioI[]; count: number }),
      catchError((e) => handleError(e))
    );
  }

  getOne(id: number) {
    const direction = `${this.url}${id}`;
    return this.http.get<ResponseI>(direction).pipe(
      map((data) => data.result as UsuarioI),
      catchError((e) => handleError(e))
    );
  }

  insert(user: UsuarioI) {
    const direction = `${this.url}/auth/register`
    return this.http.post<ResponseI>(direction, user).pipe(
      map((data) => data.result as UsuarioI),
      catchError((e) => handleError(e))
    );
  }
}
