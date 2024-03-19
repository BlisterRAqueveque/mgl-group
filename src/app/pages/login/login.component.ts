import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroEyeSlashSolid, heroEyeSolid } from '@ng-icons/heroicons/solid';
import { AuthService } from '../../services/auth/auth.service';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { firstValueFrom } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';
import { AsesorService } from '../../services/asesores/asesores.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgIconComponent,
    CommonModule,
    DialogComponent,
    DialogModule,
    InputTextModule,
    FormsModule,
  ],
  providers: [
    provideIcons({
      heroEyeSolid,
      heroEyeSlashSolid,
    }),
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  /** @description Muestra el dialogo */
  @ViewChild('dialog') dialog!: DialogComponent;

  /** @description Variable de control de estado. */
  show = false;

  constructor(
    private readonly auth: AuthService,
    private readonly asesorService: AsesorService
  ) {}

  /** @description Función para el login del usuario */
  async login(ev: Event, username: string, password: string) {
    this.dialog.loading = true;
    ev.preventDefault();
    try {
      const response = await firstValueFrom(
        this.auth.login(username, password)
      );
      this.dialog.loading = false;
    } catch (e: any) {
      console.log(e)
      switch (e.status) {
        case 401: {
          //! Acceso no autorizado.
          this.dialog.alertMessage(
            'No autorizado',
            'Las credenciales provistas son incorrectas.',
            () => {},
            true
          );
          break;
        }
        case 404: {
          //! Acceso no autorizado.
          this.dialog.alertMessage(
            'No autorizado',
            'Usuario no encontrado.',
            () => {},
            true
          );
          break;
        }
        case 300: {
          this.dialog.loading = false;
          this.token = e.error.message;
          this.visible = true;
          break;
        }
        case 400: {
          this.dialog.alertMessage(
            'No autorizado',
            'Usuario inactivo, debe solicitar ingreso nuevamente.',
            () => {},
            true
          );
          break;
        }
        default: {
          //* Mensaje por defecto.
          this.dialog.alertMessage(
            'Error interno',
            'Hubo un error en el servidor.',
            () => {},
            true
          );
        }
      }
    }
  }

  visible = false;

  token!: string;

  showNPass = false;
  showRNPass = false;
  error = false;

  newPassword: string = '';
  confirmPassword: string = '';

  comparePassword() {
    this.error = !(this.newPassword === this.confirmPassword);
  }

  changePassword() {
    this.dialog.confirm(
      'Ingreso de nueva contraseña.',
      '¿Confirma la nueva contraseña?',
      () => {
        this.dialog.loading = true
        const headers = new HttpHeaders({
          Authorization: 'Bearer ' + this.token,
        });
        this.asesorService
          .update(0, { contrasenia: this.newPassword }, headers)
          .subscribe({
            next: (data) => {
              this.newPassword = ''
              this.confirmPassword = ''
              this.dialog.alertMessage(
                'Confirmación de carga',
                'Se dio de alta la nueva contraseña.',
                () => {
                  this.visible = false
                }
              )
            },
            error: (e) => {
              console.log(e)
              this.dialog.alertMessage(
                'Error de carga',
                'Ocurrió un error al dar de alta la nueva contraseña. Intente mas tarde.',
                () => {}
              )
            },
          });
      }
    );
  }
}
