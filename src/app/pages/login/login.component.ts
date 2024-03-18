import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroEyeSlashSolid, heroEyeSolid } from '@ng-icons/heroicons/solid';
import { AuthService } from '../../services/auth/auth.service';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIconComponent, CommonModule, DialogComponent],
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

  constructor(private readonly auth: AuthService) {}

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
      console.log(e);
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
}
