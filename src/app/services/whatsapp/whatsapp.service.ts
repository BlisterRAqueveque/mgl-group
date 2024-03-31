import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs';
import { handleError } from '../../tools/tools';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WhatsAppService {
  constructor(private readonly http: HttpClient) {}

  private url = `${environment.baseUrl}`;

  getDeviceStatus() {
    const direction = `${this.url}wp/connection`;
    return this.http
      .get<{ connected: boolean; mediaUrl: string }>(direction)
      .pipe(catchError((e) => handleError(e)));
  }

  sendMessage(phone: string, message: string) {
    const direction = `${this.url}wp/send-message`;
    return this.http
      .post(direction, { phone, message })
      .pipe(catchError((e) => handleError(e)));
  }
}
