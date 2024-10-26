import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { ResponseI } from '../../../../interfaces/response.interface';
import { catchError, map } from 'rxjs';
import { handleError } from '../../../../tools/tools';
import { UsuarioI } from '../../../../interfaces/user-token.interface';
import { AseguradoraI } from '../../../../interfaces/aseguradora.interface';

@Injectable({ providedIn: 'root' })
export class FilterService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.url + 'filter/data';

  getFilterData(params?: HttpParams) {
    return this.http.get<ResponseI>(this.url, { params }).pipe(
      catchError((e) => handleError(e)),
      map(
        (data) =>
          data.result as {
            verificadores: UsuarioI[];
            aseguradoras: AseguradoraI[];
          }
      )
    );
  }
}
