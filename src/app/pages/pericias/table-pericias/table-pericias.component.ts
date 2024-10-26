import { CommonModule, formatDate } from '@angular/common';
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
import { StateButtonComponent } from '../../../shared/state-button/state-button.component';
import { PdfButtonComponent } from '../../../shared/pdf-button/pdf-button.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { RenderDirective } from '../../../directives/render.directive';
import { TabViewChangeEvent, TabViewModule } from 'primeng/tabview';

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
    StateButtonComponent,
    PdfButtonComponent,
    RenderDirective,
    TabViewModule,
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
    private readonly websocketService: SocketIoService,
    private readonly router: Router,
    private readonly auth: AuthService
  ) {}

  params = new HttpParams();

  async ngAfterViewInit() {
    const user = await this.auth.returnUserInfo();
    if (user?.rol !== 'admin')
      this.params = this.params.set('verificador', user?.id!);
    this.params = this.params.set('page', 1);
    this.params = this.params.set('perPage', 10);
    this.params = this.params.set('sortBy', 'DESC');
    this.params = this.params.set('activo', 1);
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
        console.error(e);
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
        this.dialog.alertMessage(
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
  disconnectSocket() {
    this.websocketService.disconnectSocket();
  }

  connectionError!: boolean;
  async checkDeviceStatus() {
    this.connectionError = false;
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
      this.connectionError = true;
      this.disconnectSocket();
    }
  }

  async sendMessage(pericia: PericiaI) {
    if (pericia.abierta) {
      //* Revisamos el estado del dispositivo conectado
      // await this.checkDeviceStatus();
      // if (!this.connectionError) {
      // if (this.isDeviceConnected) {
      this.confirmMessage(pericia);
      // } else {
      //   //Se comienza el proceso de emparejamiento
      //   this.websocketService.initSocket(); //* Conexión al servidor
      //   this.receiveSocketResponse();
      //   this.visible = true;
      // }
      // } else {
      //   this.dialog.alertMessage(
      //     'Error interno',
      //     'Ocurrió un error al intentar conectarse al servidor.',
      //     () => {},
      //     true
      //   );
      // }
    } else {
      this.dialog.alertMessage(
        'Pericia cerrada',
        'Esta pericia se encuentra cerrada, no puede dar aviso para su seguimiento',
        () => {},
        true
      );
    }
  }

  confirmMessage(pericia: PericiaI) {
    const message = `Seguimiento de nueva pericia:
Día: ${formatDate(pericia.fecha_asignado, 'dd/MM/yyyy', 'en-US')}.
Aseguradora: ${
      pericia.aseguradora ? pericia.aseguradora?.nombre : 'no asignado'
    }.
N° de siniestro: ${pericia.n_siniestro ? pericia.n_siniestro : 'no tiene'}.
N° de denuncia: ${pericia.n_denuncia ? pericia.n_denuncia : 'no tiene'}.
Nombre asegurado: ${pericia.nombre_asegurado}.
Dirección: ${pericia.dir_asegurado ? pericia.dir_asegurado : 'sin datos'}.
Teléfono: ${pericia.tel_asegurado ? pericia.tel_asegurado : 'sin datos'}.
Email: ${pericia.mail_asegurado ? pericia.mail_asegurado : 'sin datos'}.
Tipo de siniestro: ${
      pericia.tipo_siniestro ? pericia.tipo_siniestro?.nombre : 'no asignado'
    }.
Vehículo: ${pericia.veh_asegurado ?? 'sin datos'}.
Patente: ${pericia.patente_asegurado ?? 'sin datos'}.
*¡Que tenga un excelente día!*`;

    this.dialog.confirm(
      'Confirmación',
      '¿Enviar mensaje con los datos al verificador?',
      () => {
        window.open(
          `https://wa.me/549${
            pericia?.verificador?.tel
          }?text=${encodeURIComponent(message)}`,
          '_blank'
        );
        // this.whatsappService
        //   .sendMessage('549' + pericia.verificador?.tel!, message)
        //   .subscribe((data) => console.error(data));
      }
    );
  }

  changeState(pericia: PericiaI) {
    this.dialog.confirm(
      'Confirmación de carga',
      `¿Desea ${pericia.abierta ? 'cerrar' : 'abrir'} esta pericia?`,
      () => {
        this.dialog.loading = true;
        this.periciaService
          .update(pericia.id!, { abierta: !pericia.abierta })
          .subscribe({
            next: (data) => {
              pericia.abierta = !pericia.abierta;
              this.dialog.alertMessage(
                'Confirmación de carga',
                `El estado se cambio a ${
                  pericia.abierta ? 'abierta' : 'cerrada'
                }`,
                () => {}
              );
            },
            error: (e) => {
              console.error(e);
              this.dialog.alertMessage(
                'Error de carga',
                'Ocurrió un error al intentar cambiar el estado.',
                () => {},
                true
              );
            },
          });
      }
    );
  }
  // --------------------------------------------------------------------------------------------->

  openPericia(id: number) {
    this.router.navigate(['informes'], { queryParams: { pericia: id } });
  }

  changeTab(ev: TabViewChangeEvent) {
    switch (ev.index) {
      case 0: {
        this.params = this.params.set('activo', 1);
        this.params = this.params.delete('informe');
        this.params = this.params.delete('limite');
        this.params = this.params.delete('terminado');
        this.getHistoric();
        break;
      }
      case 1: {
        this.params = this.params.set('activo', 0);
        this.params = this.params.delete('informe');
        this.params = this.params.delete('limite');
        this.params = this.params.delete('terminado');
        this.getHistoric();
        break;
      }
      case 2: {
        this.params = this.params.set('informe', 1);
        this.params = this.params.set('terminado', 1);
        this.params = this.params.set('activo', 1);
        this.params = this.params.delete('limite');
        this.getHistoric();
        break;
      }
      case 3: {
        //* Con informes parciales
        this.params = this.params.set('informe', 1);
        this.params = this.params.set('activo', 1);
        this.params = this.params.set('terminado', 0);
        this.params = this.params.delete('limite');
        this.getHistoric();
        break;
      }
      case 4: {
        this.params = this.params.set('limite', 1);
        this.params = this.params.set('activo', 1);
        this.params = this.params.delete('terminado');
        this.params = this.params.delete('informe');
        this.getHistoric();
        break;
      }
      case 5: {
        this.params = this.params.set('informe', 0);
        this.params = this.params.set('activo', 1);
        this.params = this.params.delete('terminado');
        this.params = this.params.delete('limite');
        this.getHistoric();
        break;
      }
    }
  }

  setDifferenceDate(date: string, state: boolean) {
    if (state) {
      const fromDate = new Date(date);
      const today = new Date();
      const differenceMS = today.getTime() - fromDate.getTime();
      const differenceDays = Math.floor(differenceMS / (1000 * 60 * 60 * 24));
      return differenceDays;
    } else {
      return -1;
    }
  }

  returnDelayTime(days: number) {
    if (days === -1) return '';
    if (days >= 7) return 'danger';
    if (days < 7 && days >= 4) return 'warning';
    else return '';
  }
}
