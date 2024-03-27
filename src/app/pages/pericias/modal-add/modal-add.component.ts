import { CommonModule, formatDate } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { InputMaskModule } from 'primeng/inputmask';
import { RippleModule } from 'primeng/ripple';
import { PericiaService } from '../../../services/pericias/pericias.service';
import { AseguradoraI } from '../../../interfaces/aseguradora.interface';
import { TipoSiniestroI } from '../../../interfaces/tipo-siniestro.interface';
import { UsuarioI } from '../../../interfaces/user-token.interface';
import { AuthService } from '../../../services/auth/auth.service';
import { PericiaI } from '../../../interfaces/pericia.interface';
import { DialogComponent } from '../../../shared/dialog/dialog.component';

@Component({
  selector: 'app-modal-add',
  standalone: true,
  imports: [
    DialogModule,
    CommonModule,
    FormsModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    InputMaskModule,
    RippleModule,
    DialogComponent,
  ],
  templateUrl: './modal-add.component.html',
  styleUrl: './modal-add.component.css',
})
export class ModalAddComponent {
  constructor(
    private readonly periciaService: PericiaService,
    private readonly auth: AuthService
  ) {}

  /** @description Información del usuario */
  user!: UsuarioI;

  /** @description Variables contenedoras de las entidades traídas desde la base de datos. */
  aseguradoras!: AseguradoraI[];
  tipos!: TipoSiniestroI[];
  verificadores!: UsuarioI[];

  /** @description Variables que van a contener el resultado seleccionado de cada lista. */
  selectedAseguradora!: AseguradoraI | null;
  selectedTipo!: TipoSiniestroI | null;
  selectedVerificador!: UsuarioI | null;

  fecha_asignado!: any;
  n_siniestro!: number | undefined;
  n_denuncia!: number | undefined;
  nombre_asegurado!: string;
  dir_asegurado!: string;
  tel_asegurado!: string;
  mail_asegurado!: string;
  veh_asegurado!: string;
  patente_asegurado!: string;

  async ngOnInit() {
    this.user = (await this.auth.returnUserInfo()) as UsuarioI;
    this.periciaService.getFormFormat().subscribe({
      next: (data) => {
        this.aseguradoras = data.aseguradoras;
        this.tipos = data.tipos;
        data.verificadores.forEach((verificador) => {
          verificador.nombre = `${verificador.nombre} ${verificador.apellido}`;
        });
        this.verificadores = data.verificadores;
      },
      error: (e) => {
        console.log(e);
      },
    });
  }
  /** @description Set the visibility of the modal */
  visible = false;

  showModal(pericia?: PericiaI) {
    //* Podemos mandar la pericia como parámetro
    if (pericia) {
      this.pericia = pericia;
      this.fecha_asignado = new Date(pericia.fecha_asignado);
      this.selectedAseguradora = this.aseguradoras.find(
        (i) => i.id === pericia?.aseguradora?.id
      )!;
      this.selectedTipo = this.tipos.find(
        (i) => i.id === pericia?.tipo_siniestro?.id
      )!;
      this.selectedVerificador = this.verificadores.find(
        (i) => i.id === pericia?.verificador?.id
      )!;
      this.n_siniestro = pericia.n_siniestro!;
      this.n_denuncia = pericia.n_denuncia!;
      this.nombre_asegurado = pericia.nombre_asegurado;
      this.dir_asegurado = pericia.dir_asegurado;
      this.tel_asegurado = pericia.tel_asegurado;
      this.mail_asegurado = pericia.mail_asegurado;
      this.veh_asegurado = pericia.veh_asegurado;
      this.patente_asegurado = pericia.patente_asegurado;
    }
    this.visible = true;
  }

  dismissModal() {
    this.error = false;
    this.visible = false;
    //* Reiniciamos el valor de las pericias.
    this.fecha_asignado = '';
    this.n_siniestro = undefined;
    this.n_denuncia = undefined;
    this.nombre_asegurado = '';
    this.dir_asegurado = '';
    this.tel_asegurado = '';
    this.mail_asegurado = '';
    this.veh_asegurado = '';
    this.patente_asegurado = '';
    this.selectedAseguradora = null;
    this.selectedTipo = null;
    this.selectedVerificador = null;
    //* Reiniciamos el valor de la pericia en caso de ser cargado.
    this.pericia = undefined;
  }

  error = false;

  /** @description Al crearse la entidad, enviamos el resultado */
  @Output() emitNewPericia = new EventEmitter<PericiaI>();

  /** @description Instancia del componente dialog */
  @ViewChild('dialog') dialog!: DialogComponent;

  /** @description Muestra el dialogo para el insert */
  insertDialog() {
    const newPericia: PericiaI = {
      fecha_asignado: this.fecha_asignado,
      n_siniestro: this.n_siniestro!,
      n_denuncia: this.n_denuncia!,
      nombre_asegurado: this.nombre_asegurado,
      dir_asegurado: this.dir_asegurado,
      tel_asegurado: this.tel_asegurado,
      mail_asegurado: this.mail_asegurado,
      veh_asegurado: this.veh_asegurado,
      patente_asegurado: this.patente_asegurado,
      aseguradora: this.selectedAseguradora!,
      tipo_siniestro: this.selectedTipo!,
      verificador: this.selectedVerificador!,
      usuario_carga: this.user,
    };
    if (this.validation(newPericia)) {
      this.dialog.confirm(
        'Carga de nueva pericia.',
        'Está a punto de dar de alta una nueva pericia, ¿Desea continuar?',
        () => {
          this.insert(newPericia);
        }
      );
    } else {
      this.error = true;
      this.dialog.alertMessage(
        'Error de carga',
        '¡Falta completar algunos campos!',
        () => {},
        true
      );
    }
  }

  /** @description Insertamos la nueva pericia */
  insert(newPericia: PericiaI) {
    this.dialog.loading = true;
    this.periciaService.insert(newPericia).subscribe({
      next: (data) => {
        this.dialog.alertMessage(
          'Confirmación de carga',
          'La pericia fue creada correctamente.',
          () => {
            //* Mandamos el nuevo usuario al componente suscrito
            this.emitNewPericia.emit(data);
            this.error = false;
            this.visible = false;
            //* Reiniciamos el valor de los usuarios
            this.fecha_asignado = '';
            this.n_siniestro = undefined;
            this.n_denuncia = undefined;
            this.nombre_asegurado = '';
            this.dir_asegurado = '';
            this.tel_asegurado = '';
            this.mail_asegurado = '';
            this.veh_asegurado = '';
            this.patente_asegurado = '';
          }
        );
      },
      error: (e) => {
        switch (e.status) {
          default: {
            this.dialog.alertMessage(
              'Error de carga',
              'No se pudo crear la pericia, error interno.',
              () => {},
              true
            );
          }
        }
      },
    });
  }

  validation(pericia: PericiaI): boolean {
    // Verifica si alguna propiedad está vacía o es null/undefined
    if (
      !pericia.fecha_asignado ||
      !pericia.n_siniestro ||
      !pericia.n_denuncia ||
      !pericia.nombre_asegurado ||
      !pericia.patente_asegurado ||
      !pericia.aseguradora ||
      !pericia.tipo_siniestro ||
      !pericia.verificador
    ) {
      return false; // Al menos una propiedad no está completa
    }
    return true; // Todas las propiedades están completadas
  }

  //----------------------------------------------------------------------------------->
  /**                              Sección readonly                                   */
  pericia!: PericiaI | undefined;

  //TODO Cuando se cargue el edit, poner la variable date
  updateDialog() {
    const pericia: PericiaI = {
      fecha_asignado: this.fecha_asignado,
      aseguradora: this.selectedAseguradora!,
      n_siniestro: this.n_siniestro!,
      n_denuncia: this.n_denuncia!,
      nombre_asegurado: this.nombre_asegurado,
      dir_asegurado: this.dir_asegurado,
      tel_asegurado: this.tel_asegurado,
      mail_asegurado: this.mail_asegurado,
      tipo_siniestro: this.selectedTipo!,
      veh_asegurado: this.veh_asegurado,
      patente_asegurado: this.patente_asegurado,
      verificador: this.selectedVerificador!,
    };
    if (this.validation(pericia)) {
      this.dialog.confirm(
        'Edición de pericia.',
        'Está a punto de editar la información de la pericia. ¿Desea continuar?',
        () => {
          this.update(pericia);
        }
      );
    } else {
      this.error = true;
      this.dialog.alertMessage(
        'Error de carga',
        '¡Falta completar algunos campos!',
        () => {},
        true
      );
    }
  }

  @Output() emitUpdatePericia = new EventEmitter<PericiaI>();
  update(pericia: PericiaI) {
    this.periciaService.update(this.pericia?.id!, pericia).subscribe({
      next: (data) => {
        this.dialog.alertMessage(
          'Confirmación de carga',
          'La pericia fue editada correctamente.',
          () => {
            //* Mandamos la entidad al componente suscrito
            this.emitUpdatePericia.emit(data);
            this.error = false;
            this.visible = false;
            //* Reiniciamos el valor
            this.pericia = undefined;
          }
        );
      },
      error: (e) => {
        console.log(e);
        this.dialog.alertMessage(
          'Error de carga',
          'No se pudo editar la pericia, hubo un error de servidor.',
          () => {},
          true
        );
      },
    });
  }

  changeState(pericia: PericiaI) {
    this.dialog.confirm(
      'Edición de pericia.',
      `¿Esta seguro de ${
        pericia.activo ? 'desactivar' : 'activar'
      } la siguiente pericia del asegurado: ${pericia.nombre_asegurado}?`,
      () => {
        pericia.activo = !pericia.activo;
        this.periciaService.update(pericia?.id!, pericia).subscribe({
          next: (data) => {
            this.dialog.alertMessage(
              'Confirmación de carga',
              'La pericia fue editada correctamente.',
              () => {}
            );
          },
          error: (e) => {
            console.log(e);
            this.dialog.alertMessage(
              'Error de carga',
              'No se pudo editar la pericia, hubo un error de servidor.',
              () => {},
              true
            );
          },
        });
      }
    );
  }
  //----------------------------------------------------------------------------------->
}
