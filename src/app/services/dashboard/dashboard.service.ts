import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ResponseI } from '../../interfaces/response.interface';
import { catchError, map } from 'rxjs';
import { DashboardI } from '../../interfaces/dashboard.interface';
import { handleError } from '../../tools/tools';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private readonly http: HttpClient) {}

  private url = environment.url;

  getDashboard() {
    return this.http.get<ResponseI>(this.url).pipe(
      map((data) => data.result as DashboardI),
      catchError((e) => handleError(e))
    );
  }
}
