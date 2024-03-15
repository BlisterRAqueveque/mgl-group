import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { CardUsersComponent } from '../users/card-users/card-users.component';
import { ModalAddSiniestroComponent } from './modal-add-siniestro/modal-add-siniestro.component';
import { TableSiniestrosComponent } from './table-siniestros/table-siniestros.component';

@Component({
  selector: 'app-siniestros',
  standalone: true,
  imports: [
    CardUsersComponent,
    ModalAddSiniestroComponent,
    ButtonComponent,
    TableSiniestrosComponent,
  ],
  templateUrl: './siniestros.component.html',
  styleUrl: './siniestros.component.css',
})
export class SiniestrosComponent {}
