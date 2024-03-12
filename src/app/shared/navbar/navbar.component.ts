import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DialogComponent,
  ],
  providers: [Router],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  @ViewChild('dialog') dialog!: DialogComponent

  constructor(private readonly auth: AuthService) {}

  show = false

  logout() {
    this.dialog.confirm(
      'Confirmar',
      '¿Realmente desear cerrar sesión?',
      () => {
        this.auth.logout()
      }
    )
  }
}
