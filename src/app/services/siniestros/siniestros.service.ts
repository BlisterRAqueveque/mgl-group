import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TipoSiniestroI } from '../../interfaces/tipo-siniestro.interface';
import { ResponseI } from '../../interfaces/response.interface';
import { catchError, map } from 'rxjs';
import { handleError } from '../../tools/tools';

@Injectable({
  providedIn: 'root',
})
export class SiniestroService {
  constructor(private readonly http: HttpClient) {}

  url = `${environment.url}tipo-siniestros/`;

  getAllFilter(params: HttpParams) {
    return this.http.get<ResponseI>(this.url, { params }).pipe(
      map((data) => data.result as { entities: TipoSiniestroI[]; count: number }),
      catchError((e) => handleError(e))
    );
  }

  /** @description Inserta una nueva entidad en la base de datos. */
  insert(siniestro: TipoSiniestroI) {
    return this.http.post<ResponseI>(this.url, siniestro).pipe(
      map((data) => data.result as TipoSiniestroI),
      catchError((e) => handleError(e))
    );
  }

  /** @description Actualiza la entidad en la base de datos. */
  update(id: number, siniestro: Partial<TipoSiniestroI>) {
    const direction = `${this.url}${id}`
    return this.http.put<ResponseI>(direction, siniestro).pipe(
      map(data => data.result as TipoSiniestroI),
      catchError((e) => handleError(e))
    )
  }

  delete(id:number) {
    const direction = `${this.url}${id}`
    return this.http.delete<ResponseI>(direction).pipe(
      map(data => data.result as TipoSiniestroI),
      catchError((e) => handleError(e))
    )
  }
}
