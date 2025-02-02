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
import { AseguradoraService } from '../../../services/aseguradoras/aseguradoras.service';
import { AuthService } from '../../../services/auth/auth.service';
import { UsuarioI } from '../../../interfaces/user-token.interface';
import { AseguradoraI } from '../../../interfaces/aseguradora.interface';
import { DialogComponent } from '../../../shared/dialog/dialog.component';

@Component({
  selector: 'app-modal-add-aseguradora',
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
  templateUrl: './modal-add-aseguradora.component.html',
  styleUrl: './modal-add-aseguradora.component.css',
})
export class ModalAddAseguradoraComponent {
  constructor(
    private readonly aseguradoraService: AseguradoraService,
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

  showModal(aseguradora?: AseguradoraI) {
    //* Podemos mandar la aseguradora como parámetro
    if (aseguradora) {
      this.aseguradora = aseguradora;
      this.nombre = aseguradora.nombre;
      this.CUIT = aseguradora.CUIT;
    }
    this.visible = true;
  }

  dismissModal() {
    this.error = false;
    this.visible = false;
    //* Reiniciamos el valor de las aseguradoras.
    this.nombre = '';
    this.CUIT = '';
    //* Reiniciamos el valor de la aseguradora en caso de ser cargado.
    this.aseguradora = undefined;
  }

  nombre!: string;
  CUIT!: string;

  error = false;

  /** @description Al crearse la entidad, enviamos el resultado */
  @Output() emitNewAseguradora = new EventEmitter<AseguradoraI>();

  /** @description Instancia del componente dialog */
  @ViewChild('dialog') dialog!: DialogComponent;

  /** @description Muestra el dialogo para el insert */
  insertDialog() {
    const newAseguradora: AseguradoraI = {
      nombre: this.nombre,
      CUIT: this.CUIT,
      usuario_carga: this.user,
    };
    if (this.validation(newAseguradora)) {
      this.dialog.confirm(
        'Carga de nueva aseguradora.',
        'Está a punto de dar de alta una nueva aseguradora, ¿Desea continuar?',
        () => {
          this.insert(newAseguradora);
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

  /** @description Insertamos la nueva aseguradora */
  insert(newAseguradora: AseguradoraI) {
    this.dialog.loading = true;
    this.aseguradoraService.insert(newAseguradora).subscribe({
      next: (data) => {
        this.dialog.alertMessage(
          'Confirmación de carga',
          'La aseguradora fue creada correctamente.',
          () => {
            //* Mandamos el nuevo usuario al componente suscrito
            this.emitNewAseguradora.emit(data);
            this.error = false;
            this.visible = false;
            //* Reiniciamos el valor de los usuarios
            this.nombre = '';
            this.CUIT = '';
          }
        );
      },
      error: (e) => {
        switch (e.status) {
          case 409: {
            this.dialog.alertMessage(
              'Error de carga',
              'No se pudo cargar porque ya existe una entidad con el mismo CUIT.',
              () => {},
              true
            );
            break;
          }
          default: {
            this.dialog.alertMessage(
              'Error de carga',
              'No se pudo crear la aseguradora, error interno.',
              () => {},
              true
            );
          }
        }
      },
    });
  }

  validation(aseguradora: AseguradoraI): boolean {
    // Verifica si alguna propiedad está vacía o es null/undefined
    if (!aseguradora.nombre) {
      return false; // Al menos una propiedad no está completa
    }
    return true; // Todas las propiedades están completadas
  }

  //----------------------------------------------------------------------------------->
  /**                              Sección readonly                                   */
  aseguradora!: AseguradoraI | undefined;

  updateDialog() {
    if (this.validation(this.aseguradora as AseguradoraI)) {
      this.dialog.confirm(
        'Edición de aseguradora.',
        'Está a punto de editar la información de la aseguradora. ¿Desea continuar?',
        () => {
          this.update();
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

  update() {
    this.dialog.loading = true;
    this.aseguradora!.nombre = this.nombre;
    this.aseguradora!.CUIT = this.CUIT;
    this.aseguradoraService
      .update(this.aseguradora?.id!, this.aseguradora as AseguradoraI)
      .subscribe({
        next: (data) => {
          this.dialog.alertMessage(
            'Confirmación de carga',
            'La aseguradora fue editada correctamente.',
            () => {
              //* Mandamos la nueva aseguradora al componente suscrito
              this.error = false;
              this.visible = false;
              //* Reiniciamos el valor de las aseguradoras
              this.aseguradora = undefined;
            }
          );
        },
        error: (e) => {
          console.error(e);
          this.dialog.alertMessage(
            'Error de carga',
            'No se pudo editar la aseguradora, hubo un error de servidor.',
            () => {},
            true
          );
        },
      });
  }

  changeState(aseguradora: AseguradoraI) {
    this.dialog.confirm(
      'Edición de aseguradora.',
      `¿Esta seguro de ${
        aseguradora.activo ? 'desactivar' : 'activar'
      } la siguiente aseguradora: ${aseguradora.nombre}?`,
      () => {
        this.dialog.loading = true;
        aseguradora.activo = !aseguradora.activo;
        this.aseguradoraService
          .update(aseguradora?.id!, aseguradora)
          .subscribe({
            next: (data) => {
              this.dialog.alertMessage(
                'Confirmación de carga',
                'La aseguradora fue editada correctamente.',
                () => {}
              );
            },
            error: (e) => {
              console.error(e);
              this.dialog.alertMessage(
                'Error de carga',
                'No se pudo editar la aseguradora, hubo un error de servidor.',
                () => {},
                true
              );
            },
          });
      }
    );
  }

  @Output() emitDelete = new EventEmitter<number>();
  delete() {
    this.dialog.confirm(
      'Eliminar aseguradora',
      '¿Está seguro de eliminar este registro? Puede que esta acción sea irreversible.',
      () => {
        this.dialog.loading = true;
        this.aseguradoraService.delete(this.aseguradora?.id!).subscribe({
          next: (data) => {
            this.dialog.alertMessage(
              'Confirmación de carga',
              'La aseguradora fue eliminada correctamente.',
              () => {
                this.emitDelete.emit(this.aseguradora?.id);
                this.aseguradora = undefined;
                this.visible = false;
              }
            );
          },
          error: (e) => {
            console.error(e);
            this.dialog.alertMessage(
              'Error de carga',
              'No se pudo eliminar la aseguradora, hubo un error de servidor.',
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
      !this.aseguradora ? this.insertDialog() : this.updateDialog();
    }
  }
}
