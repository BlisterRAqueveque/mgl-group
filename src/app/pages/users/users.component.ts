import { Component, ViewChild } from '@angular/core';
import { TableUsersComponent } from './table-users/table-users.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { ModalAddUsersComponent } from './modal-add-users/modal-add-users.component';
import { UsuarioI } from '../../interfaces/user-token.interface';
import { CommonModule } from '@angular/common';
import { RenderDirective } from '../../directives/render.directive';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    TableUsersComponent,
    ButtonComponent,
    ModalAddUsersComponent,
    CommonModule,
    RenderDirective,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent {
  @ViewChild('table') table!: TableUsersComponent;

  addAsesor(user: UsuarioI) {
    this.table.asesores.unshift(user);
  }
}
