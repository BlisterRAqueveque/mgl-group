import { Component, ViewChild } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { CardUsersComponent } from '../users/card-users/card-users.component';
import { ModalAddAseguradoraComponent } from './modal-add-aseguradora/modal-add-aseguradora.component';
import { TableAseguradorasComponent } from './table-aseguradoras/table-aseguradoras.component';
import { AseguradoraI } from '../../interfaces/aseguradora.interface';

@Component({
  selector: 'app-aseguradoras',
  standalone: true,
  imports: [
    CardUsersComponent,
    ModalAddAseguradoraComponent,
    ButtonComponent,
    TableAseguradorasComponent,
  ],
  templateUrl: './aseguradoras.component.html',
  styleUrl: './aseguradoras.component.css',
})
export class AseguradorasComponent {
  @ViewChild('table') table!: TableAseguradorasComponent

  addAseguradora(user: AseguradoraI) {
    this.table.aseguradoras.unshift(user)
  }

  deleteAseguradora(id: number) {
    this.table.aseguradoras = this.table.aseguradoras.filter(item => item.id !== id )
  }
}
