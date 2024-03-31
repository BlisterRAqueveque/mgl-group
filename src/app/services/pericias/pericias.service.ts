import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ResponseI } from '../../interfaces/response.interface';
import { catchError, map } from 'rxjs';
import { PericiaI } from '../../interfaces/pericia.interface';
import { AseguradoraI } from '../../interfaces/aseguradora.interface';
import { TipoSiniestroI } from '../../interfaces/tipo-siniestro.interface';
import { UsuarioI } from '../../interfaces/user-token.interface';
import { handleError } from '../../tools/tools';

@Injectable({
  providedIn: 'root',
})
export class PericiaService {
  constructor(private readonly http: HttpClient) {}

  private url = `${environment.url}pericias/`;

  getFormFormat() {
    const direction = `${this.url}get/form-format/`;
    return this.http.get<ResponseI>(direction).pipe(
      map(
        (map) =>
          map.result as {
            aseguradoras: AseguradoraI[];
            tipos: TipoSiniestroI[];
            verificadores: UsuarioI[];
          }
      ),
      catchError((e) => handleError(e))
    );
  }

  /** @description Inserta una nueva entidad en la base de datos. */
  insert(pericia: PericiaI) {
    return this.http.post<ResponseI>(this.url, pericia).pipe(
      map((data) => data.result as PericiaI),
      catchError((e) => handleError(e))
    );
  }

  /** @description Actualiza la entidad en la base de datos. */
  update(id: number, siniestro: Partial<PericiaI>) {
    const direction = `${this.url}${id}`;
    return this.http.put<ResponseI>(direction, siniestro).pipe(
      map((data) => data.result as PericiaI),
      catchError((e) => handleError(e))
    );
  }

  getAllFilter(params: HttpParams) {
    return this.http.get<ResponseI>(this.url, { params }).pipe(
      map((data) => data.result as { entities: PericiaI[]; count: number }),
      catchError((e) => handleError(e))
    );
  }

  getOne(id: number) {
    const direction = `${this.url}${id}`;
    return this.http.get<ResponseI>(direction).pipe(
      map((data) => data.result as PericiaI),
      catchError((e) => handleError(e))
    );
  }
}
