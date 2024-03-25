import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs';
import { handleError } from '../../tools/tools';

@Injectable({
  providedIn: 'root',
})
export class WhatsAppService {
  constructor(private readonly http: HttpClient) {}

  private url = 'http://localhost:3002/';

  getDeviceStatus() {
    const direction = `${this.url}connection/`;
    return this.http
      .get<{ connected: boolean; mediaUrl: string }>(direction)
      .pipe(catchError((e) => handleError(e)));
  }

  sendMessage(phone: string, message: string) {
    const direction = `${this.url}send-message/`;
    return this.http
      .post(direction, { phone, message })
      .pipe(catchError((e) => handleError(e)));
  }
}
