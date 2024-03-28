import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AseguradoraI } from '../../interfaces/aseguradora.interface';
import { map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponseI } from '../../interfaces/response.interface';
import { handleError } from '../../tools/tools';

@Injectable({
  providedIn: 'root',
})
export class AseguradoraService {
  constructor(private readonly http: HttpClient) {}

  url = `${environment.url}aseguradoras/`;

  getAllFilter(params: HttpParams) {
    return this.http.get<ResponseI>(this.url, { params }).pipe(
      map((data) => data.result as { entities: AseguradoraI[]; count: number }),
      catchError((e) => handleError(e))
    );
  }

  /** @description Inserta una nueva entidad en la base de datos. */
  insert(siniestro: AseguradoraI) {
    return this.http.post<ResponseI>(this.url, siniestro).pipe(
      map((data) => data.result as AseguradoraI),
      catchError((e) => handleError(e))
    );
  }

  /** @description Actualiza la entidad en la base de datos. */
  update(id: number, siniestro: Partial<AseguradoraI>) {
    const direction = `${this.url}${id}`;
    return this.http.put<ResponseI>(direction, siniestro).pipe(
      map((data) => data.result as AseguradoraI),
      catchError((e) => handleError(e))
    );
  }

  delete(id: number) {
    const direction = `${this.url}${id}`;
    return this.http.delete<ResponseI>(direction).pipe(
      map((data) => data.result as AseguradoraI),
      catchError((e) => handleError(e))
    );
  }
}
