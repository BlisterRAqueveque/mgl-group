import { Component, ViewChild } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { ModalAddComponent } from './modal-add/modal-add.component';
import { TablePericiasComponent } from './table-pericias/table-pericias.component';
import { PericiaI } from '../../interfaces/pericia.interface';

@Component({
  selector: 'app-pericias',
  standalone: true,
  imports: [
    ModalAddComponent,
    ButtonComponent,
    TablePericiasComponent,
  ],
  templateUrl: './pericias.component.html',
  styleUrl: './pericias.component.css',
})
export class PericiasComponent {
  @ViewChild('table') table!: TablePericiasComponent;

  addPericia(user: PericiaI) {
    this.table.pericias.unshift(user)
  }

  deletePericia(id: number) {
    this.table.pericias = this.table.pericias.filter(item => item.id !== id )
  }
}
