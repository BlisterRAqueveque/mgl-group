import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { Roles, UsuarioI } from '../../../interfaces/user-token.interface';
import { AsesorService } from '../../../services/asesores/asesores.service';
import { AuthService } from '../../../services/auth/auth.service';
import { DialogComponent } from '../../../shared/dialog/dialog.component';

@Component({
  selector: 'app-modal-add-users',
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
    TooltipModule,
    DialogComponent,
  ],
  templateUrl: './modal-add-users.component.html',
  styleUrl: './modal-add-users.component.css',
})
export class ModalAddUsersComponent {
  constructor(
    private readonly asesorService: AsesorService,
    private readonly auth: AuthService
  ) {}

  tooltipText =
    'Al agregar un asesor, se crea automáticamente un usuario nuevo. Tener en cuenta de realizar las modificaciones correspondientes luego de realizado.';
  /** @description Set the visibility of the modal */
  visible = false;

  /** @description Con esta variable controlamos la carga de los campos */
  error = false;

  /** @description Muestra el modal */
  showModal(asesor?: UsuarioI) {
    //* Podemos mandar al asesor como parámetro
    if (asesor) {
      this.asesor = asesor;
      this.selectedRol = this.roles.find((item) => item.rol === asesor.rol)!;
    }
    this.visible = true;
  }

  /** @description Esconde el modal */
  dismissModal() {
    this.error = false;
    this.visible = false;
    //* Reiniciamos el valor de los usuarios.
    this.newUser = {
      nombre: '',
      apellido: '',
      username: '',
      tel: '',
      email: '',
      rol: Roles.user,
    };
    //* Reiniciamos el valor del asesor en caso de ser cargado.
    this.asesor = undefined;
  }

  /** @description Roles del usuario */
  roles = [
    { name: 'Administrador', rol: Roles.admin },
    { name: 'Solo asesor', rol: Roles.user },
    { name: 'Solo visita', rol: Roles.visit },
  ];
  /** @description El rol por defecto */
  selectedRol: { name: string; rol: Roles } = {
    name: 'Solo asesor',
    rol: Roles.user,
  };

  /** @description Al crearse el usuario, enviamos el resultado */
  @Output() newAsesor = new EventEmitter<UsuarioI>();

  /** @description Instancia del componente dialog */
  @ViewChild('dialog') dialog!: DialogComponent;

  /** @description En el inicio, traemos la información del usuario */
  async ngOnInit() {
    this.user = (await this.auth.returnUserInfo()) as UsuarioI;
  }

  /** @description Información del usuario */
  user!: UsuarioI;

  /** @description Nuevo usuario */
  newUser: UsuarioI = {
    nombre: '',
    apellido: '',
    username: '',
    tel: '',
    email: '',
    rol: Roles.user,
  };

  /** @description Muestra el dialogo para el insert */
  insertDialog() {
    if (this.validation(this.newUser)) {
      this.dialog.confirm(
        'Carga de nuevo asesor.',
        'Está a punto de dar de alta un nuevo asesor, también se creará un nuevo usuario para los seguimientos. ¿Desea continuar?',
        () => {
          this.insert();
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

  /** @description Insertamos el nuevo usuario */
  insert() {
    this.dialog.loading = true;
    this.newUser.usuario_carga = this.user;
    this.newUser.rol = this.selectedRol.rol;
    this.asesorService.insert(this.newUser).subscribe({
      next: (data) => {
        this.dialog.alertMessage(
          'Confirmación de carga',
          'El asesor fue creado correctamente.',
          () => {
            //* Mandamos el nuevo usuario al componente suscrito
            this.newAsesor.emit(data);
            this.error = false;
            this.visible = false;
            //* Reiniciamos el valor de los usuarios
            this.newUser = {
              nombre: '',
              apellido: '',
              username: '',
              tel: '',
              email: '',
              rol: Roles.user,
            };
          }
        );
      },
      error: (e) => {
        switch (e.status) {
          case 409: {
            this.dialog.alertMessage(
              'Error de carga',
              'No se pudo crear el asesor, ya que existe uno con el mismo nombre de usuario.',
              () => {},
              true
            );
          }
        }
      },
    });
  }

  validation(usuario: UsuarioI): boolean {
    // Verifica si alguna propiedad está vacía o es null/undefined
    if (!usuario.nombre || !usuario.apellido || !usuario.username) {
      return false; // Al menos una propiedad no está completa
    }
    return true; // Todas las propiedades están completadas
  }

  //----------------------------------------------------------------------------------->
  /**                              Sección readonly                                   */
  asesor!: UsuarioI | undefined;

  updateDialog() {
    if (this.validation(this.asesor as UsuarioI)) {
      this.dialog.confirm(
        'Edición de asesor.',
        'Está a punto de editar la información del asesor. ¿Desea continuar?',
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
    this.asesor!!.rol = this.selectedRol.rol;
    this.asesorService
      .update(this.asesor?.id!, this.asesor as UsuarioI)
      .subscribe({
        next: (data) => {
          this.dialog.alertMessage(
            'Confirmación de carga',
            'El asesor fue editado correctamente.',
            () => {
              //* Mandamos el nuevo usuario al componente suscrito
              this.error = false;
              this.visible = false;
              //* Reiniciamos el valor de los usuarios
              this.asesor = undefined;
            }
          );
        },
        error: (e) => {
          console.log(e);
          this.dialog.alertMessage(
            'Error de carga',
            'No se pudo editar el asesor, hubo un error de servidor.',
            () => {},
            true
          );
        },
      });
  }

  changeState(user: UsuarioI) {
    this.dialog.confirm(
      'Edición de usuario.',
      `¿Esta seguro de ${
        user.activo ? 'desactivar' : 'activar'
      } el siguiente asesor: ${user.nombre} ${user.apellido}?`,
      () => {
        user.activo = !user.activo;
        this.asesorService.update(user?.id!, user).subscribe({
          next: (data) => {
            this.dialog.alertMessage(
              'Confirmación de carga',
              'El asesor fue editado correctamente.',
              () => {}
            );
          },
          error: (e) => {
            console.log(e);
            this.dialog.alertMessage(
              'Error de carga',
              'No se pudo editar el asesor, hubo un error de servidor.',
              () => {},
              true
            );
          },
        });
      }
    );
  }

  setPasswordUndefined() {
    this.dialog.confirm(
      'Blanqueo de contraseña.',
      '¿Está seguro de blanquear la contraseña del usuario?',
      () => {
        this.dialog.loading = true
        this.asesorService.update(this.asesor?.id!, { contrasenia: '' }).subscribe({
          next: data => {
            this.dialog.alertMessage(
              'Confirmación de carga.',
              'La contraseña se blanqueó con éxito.',
              () => {
                this.visible = false
              }
            )
          },
          error: e => {
            console.log(e)
            this.dialog.alertMessage(
              'Error de carga.',
              'Ocurrió un error en la carga. Intente nuevamente.'
            )
          }
        })
      }
    )
  }
  //----------------------------------------------------------------------------------->
}
