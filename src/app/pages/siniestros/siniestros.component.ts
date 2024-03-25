import { Component, ViewChild } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { ModalAddSiniestroComponent } from './modal-add-siniestro/modal-add-siniestro.component';
import { TableSiniestrosComponent } from './table-siniestros/table-siniestros.component';
import { TipoSiniestroI } from '../../interfaces/tipo-siniestro.interface';

@Component({
  selector: 'app-siniestros',
  standalone: true,
  imports: [
    ModalAddSiniestroComponent,
    ButtonComponent,
    TableSiniestrosComponent,
  ],
  templateUrl: './siniestros.component.html',
  styleUrl: './siniestros.component.css',
})
export class SiniestrosComponent {
  @ViewChild('table') table!: TableSiniestrosComponent

  updateTable(siniestro: TipoSiniestroI) {
    this.table.getHistoric()
  }
}
