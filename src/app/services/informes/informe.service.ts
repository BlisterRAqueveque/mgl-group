import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ResponseI } from '../../interfaces/response.interface';
import { catchError, map } from 'rxjs';
import { InformeI } from '../../interfaces/informe.interface';
import { handleError } from '../../tools/tools';

@Injectable({
  providedIn: 'root',
})
export class InformeService {
  constructor(private readonly http: HttpClient) {}
  
  private url = `${environment.url}informes`;

  insert(form: FormData) {
    return this.http.post<ResponseI>(this.url, form).pipe(
      map((data) => data.result as InformeI),
      catchError((e) => handleError(e))
    );
  }
}
