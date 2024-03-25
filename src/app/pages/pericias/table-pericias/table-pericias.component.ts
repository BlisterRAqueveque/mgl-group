import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroBarsArrowDownSolid,
  heroBarsArrowUpSolid,
} from '@ng-icons/heroicons/solid';
import { DialogModule } from 'primeng/dialog';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { PericiaI } from '../../../interfaces/pericia.interface';
import { PericiaService } from '../../../services/pericias/pericias.service';
import { SocketIoService } from '../../../services/socket.io/socket.io.service';
import { WhatsAppService } from '../../../services/whatsapp/whatsapp.service';
import { DialogComponent } from '../../../shared/dialog/dialog.component';
import { WpButtonComponent } from './../../../shared/wp-button/wp-button.component';
import { FilterPericiasComponent } from './filter-pericias/filter-pericias.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-table-pericias',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    TooltipModule,
    NgIconComponent,
    FilterPericiasComponent,
    WpButtonComponent,
    DialogModule,
    DialogComponent,
  ],
  providers: [
    provideIcons({
      heroBarsArrowUpSolid,
      heroBarsArrowDownSolid,
    }),
  ],
  templateUrl: './table-pericias.component.html',
  styleUrl: './table-pericias.component.css',
})
export class TablePericiasComponent {
  constructor(
    private readonly periciaService: PericiaService,
    private readonly whatsappService: WhatsAppService,
    private websocketService: SocketIoService
  ) {}

  params = new HttpParams();

  ngAfterViewInit() {
    this.params = this.params.set('page', 1);
    this.params = this.params.set('perPage', 10);
    this.params = this.params.set('sortBy', 'DESC');
    this.getHistoric();
  }

  pericias: PericiaI[] = [];

  totalRecords = 0;

  @ViewChild('table') table!: Table;
  @ViewChild('paginator') Paginator!: Paginator;

  async getHistoric() {
    this.table.loading = true;
    this.periciaService.getAllFilter(this.params).subscribe({
      next: (data) => {
        this.pericias = data.entities;
        this.totalRecords = data.count;
        this.table.loading = false;
      },
      error: (e) => {
        this.table.loading = false;
        console.log(e);
      },
    });
  }

  filter(ev: any) {
    this.params = this.params.set(ev.key, ev.value);
    this.getHistoric();
  }

  first: number = 0;

  rows: number = 10;

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.params = this.params.set('page', event.page + 1);
    this.params = this.params.set('perPage', event.rows);
    this.getHistoric();
  }

  onClickButton = false;
  type!: string;

  @Output() selectedRow = new EventEmitter<PericiaI>();
  @Output() setAseguradoraInactive = new EventEmitter<PericiaI>();
  onRowSelect(selectedItem: PericiaI) {
    if (this.onClickButton) {
      this.onClickButton = false;
    } else this.selectedRow.emit(selectedItem);
  }

  asc = true;
  onSort(ev: any) {
    this.asc = !this.asc;
    switch (ev.order) {
      case 1: {
        if (this.params.get('sortBy') !== 'ASC') {
          this.params = this.params.set('sortBy', 'ASC');
          this.getHistoric();
        }
        break;
      }
      case -1: {
        if (this.params.get('sortBy') !== 'DESC') {
          this.params = this.params.set('sortBy', 'DESC');
          this.getHistoric();
        }
        break;
      }
    }
  }

  // --------------------------------------------------------------------------------------------->
  /**          Esta sección corresponde a la conexión del dispositivo para mensajería            */

  @ViewChild('dialog') dialog!: DialogComponent;
  mediaUrl!: string;
  visible = false;
  isDeviceConnected = false;

  /** @description Recibe el mensaje de respuesta del servidor socket.io */
  private receiveSocketResponse() {
    this.websocketService.receiveStatus().subscribe((receivedMessage) => {
      if (receivedMessage === 'connected') {
        this.isDeviceConnected = true;
        //* Una vez conectado, nos desconectamos del servidor
        this.disconnectSocket();
        this.dialog.confirm(
          'Confirmación',
          '¡Dispositivo conectado con éxito!',
          () => {
            this.visible = false;
          }
        );
      } else {
        this.mediaUrl = '';
        this.mediaUrl = receivedMessage as string;
      }
    });
  }
  /** @description Se desconecta del servidor socket.io */
  private disconnectSocket() {
    this.websocketService.disconnectSocket();
  }

  async checkDeviceStatus() {
    try {
      const data = await firstValueFrom(this.whatsappService.getDeviceStatus());
      if (data.connected) {
        this.isDeviceConnected = true;
        //* Una vez conectado, nos desconectamos del servidor
        this.disconnectSocket();
      } else {
        this.mediaUrl = data.mediaUrl;
        this.isDeviceConnected = false;
      }
    } catch (error) {
      //TODO Manejo de errores en la conexión
    }
  }

  async sendMessage(pericia: PericiaI) {
    //* Revisamos el estado del dispositivo conectado
    await this.checkDeviceStatus();
    if (this.isDeviceConnected) {
      this.confirmMessage(pericia);
    } else {
      //Se comienza el proceso de emparejamiento
      this.websocketService.initSocket(); //* Conexión al servidor
      this.receiveSocketResponse();
      this.visible = true;
    }
  }

  confirmMessage(pericia: PericiaI) {
    this.dialog.confirm(
      'Confirmación',
      '¿Enviar mensaje con los datos al verificador?',
      () => {
        this.whatsappService
          .sendMessage('549' + pericia.verificador?.tel!, 'Test')
          .subscribe((data) => console.log(data));
      }
    );
  }
  // --------------------------------------------------------------------------------------------->
}
