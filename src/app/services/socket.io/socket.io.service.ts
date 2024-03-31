import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketIoService {
  private webSocket!: Socket;

  constructor() {}

  initSocket() {
    this.webSocket = new Socket({
      url: environment.baseUrl,
      options: {
        path: '/wp/socket.io'
      },
    });
  }

  /** @description Emitimos el mensaje al servidor */
  connectSocket(message: any) {
    this.webSocket.emit('connection', message);
  }

  /** @description Recibimos la respuesta desde el servidor */
  receiveStatus() {
    return this.webSocket.fromEvent('connection');
  }

  /** @description Nos desconectamos del servidor */
  disconnectSocket() {
    this.webSocket.disconnect();
  }
}
