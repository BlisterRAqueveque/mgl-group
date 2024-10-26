import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { SiniestroService } from '../../../services/siniestros/siniestros.service';
import { TipoSiniestroI } from '../../../interfaces/tipo-siniestro.interface';
import { DialogComponent } from '../../../shared/dialog/dialog.component';
import { UsuarioI } from '../../../interfaces/user-token.interface';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-modal-add-siniestro',
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
  templateUrl: './modal-add-siniestro.component.html',
  styleUrl: './modal-add-siniestro.component.css',
})
export class ModalAddSiniestroComponent {
  constructor(
    private readonly siniestroService: SiniestroService,
    private readonly auth: AuthService
  ) {}

  /** @description Información del usuario */
  user!: UsuarioI;

  /** @description En el inicio, traemos la información del usuario */
  async ngOnInit() {
    this.user = (await this.auth.returnUserInfo()) as UsuarioI;
  }

  /** @description Set the visibility of the modal */
  visible = false;

  showModal(siniestro?: TipoSiniestroI) {
    //* Podemos mandar al siniestro como parámetro
    if (siniestro) {
      this.siniestro = siniestro;
      this.nombre = siniestro.nombre;
    }
    this.visible = true;
  }

  dismissModal() {
    this.error = false;
    this.visible = false;
    //* Reiniciamos el valor de los siniestros.
    this.nombre = '';
    //* Reiniciamos el valor del siniestro en caso de ser cargado.
    this.siniestro = undefined;
  }

  nombre!: string;

  error = false;

  /** @description Al crearse la entidad, enviamos el resultado */
  @Output() emitNewSiniestro = new EventEmitter<TipoSiniestroI>();

  /** @description Instancia del componente dialog */
  @ViewChild('dialog') dialog!: DialogComponent;

  /** @description Muestra el dialogo para el insert */
  insertDialog() {
    const newSiniestro: TipoSiniestroI = {
      nombre: this.nombre,
      usuario_carga: this.user,
    };
    if (this.validation(newSiniestro)) {
      this.dialog.confirm(
        'Carga de nuevo siniestro.',
        'Está a punto de dar de alta un nuevo tipo de siniestro, ¿Desea continuar?',
        () => {
          this.insert(newSiniestro);
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

  /** @description Insertamos el nuevo siniestro */
  insert(newSiniestro: TipoSiniestroI) {
    this.dialog.loading = true;
    this.siniestroService.insert(newSiniestro).subscribe({
      next: (data) => {
        this.dialog.alertMessage(
          'Confirmación de carga',
          'El siniestro fue creado correctamente.',
          () => {
            //* Mandamos el nuevo usuario al componente suscrito
            this.emitNewSiniestro.emit(data);
            this.error = false;
            this.visible = false;
            //* Reiniciamos el valor de los usuarios
            this.nombre = '';
          }
        );
      },
      error: (e) => {
        switch (e.status) {
          case 409: {
            this.dialog.alertMessage(
              'Error de carga',
              'No se pudo cargar porque ya existe una entidad con el mismo nombre.',
              () => {},
              true
            );
            break;
          }
          default: {
            this.dialog.alertMessage(
              'Error de carga',
              'No se pudo crear el siniestro, error interno.',
              () => {},
              true
            );
          }
        }
      },
    });
  }

  validation(siniestro: TipoSiniestroI): boolean {
    // Verifica si alguna propiedad está vacía o es null/undefined
    if (!siniestro.nombre) {
      return false; // Al menos una propiedad no está completa
    }
    return true; // Todas las propiedades están completadas
  }

  //----------------------------------------------------------------------------------->
  /**                              Sección readonly                                   */
  siniestro!: TipoSiniestroI | undefined;

  updateDialog() {
    const siniestro: TipoSiniestroI = {
      nombre: this.nombre,
    };
    if (this.validation(siniestro)) {
      this.dialog.confirm(
        'Edición de siniestro.',
        'Está a punto de editar la información del siniestro. ¿Desea continuar?',
        () => {
          this.update(siniestro);
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

  @Output() emitUpdateSiniestro = new EventEmitter<TipoSiniestroI>();
  update(siniestro: TipoSiniestroI) {
    this.dialog.loading = true;
    this.siniestroService.update(this.siniestro?.id!, siniestro).subscribe({
      next: (data) => {
        this.dialog.alertMessage(
          'Confirmación de carga',
          'El siniestro fue editado correctamente.',
          () => {
            //* Mandamos la entidad al componente suscrito
            this.emitUpdateSiniestro.emit(data);
            this.error = false;
            this.visible = false;
            //* Reiniciamos el valor de los siniestros
            this.siniestro = undefined;
          }
        );
      },
      error: (e) => {
        console.error(e);
        this.dialog.alertMessage(
          'Error de carga',
          'No se pudo editar el siniestro, hubo un error de servidor.',
          () => {},
          true
        );
      },
    });
  }

  changeState(siniestro: TipoSiniestroI) {
    this.dialog.confirm(
      'Edición de siniestro.',
      `¿Esta seguro de ${
        siniestro.activo ? 'desactivar' : 'activar'
      } el siguiente tipo de siniestro: ${siniestro.nombre}?`,
      () => {
        this.dialog.loading = true;
        siniestro.activo = !siniestro.activo;
        this.siniestroService.update(siniestro?.id!, siniestro).subscribe({
          next: (data) => {
            this.dialog.alertMessage(
              'Confirmación de carga',
              'El siniestro fue editado correctamente.',
              () => {}
            );
          },
          error: (e) => {
            console.error(e);
            this.dialog.alertMessage(
              'Error de carga',
              'No se pudo editar el siniestro, hubo un error de servidor.',
              () => {},
              true
            );
          },
        });
      }
    );
  }

  @Output() emitDelete = new EventEmitter<TipoSiniestroI>();
  delete() {
    this.dialog.confirm(
      'Eliminar tipo de siniestro',
      '¿Está seguro de eliminar este registro? Puede que esta acción sea irreversible.',
      () => {
        this.dialog.loading = true;
        this.siniestroService.delete(this.siniestro?.id!).subscribe({
          next: (data) => {
            this.emitDelete.emit(data);
            this.dialog.alertMessage(
              'Confirmación de carga',
              'El siniestro fue eliminado correctamente.',
              () => {
                this.siniestro = undefined;
                this.visible = false;
              }
            );
          },
          error: (e) => {
            console.error(e);
            this.dialog.alertMessage(
              'Error de carga',
              'No se pudo eliminar el siniestro, hubo un error de servidor.',
              () => {},
              true
            );
          },
        });
      }
    );
  }
  //----------------------------------------------------------------------------------->

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.keyCode === 13) {
      !this.siniestro ? this.insertDialog() : this.updateDialog();
    }
  }
}
