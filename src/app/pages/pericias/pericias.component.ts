import { Component, ViewChild } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { ModalAddComponent } from './modal-add/modal-add.component';
import { TablePericiasComponent } from './table-pericias/table-pericias.component';
import { PericiaI } from '../../interfaces/pericia.interface';
import { RenderDirective } from '../../directives/render.directive';

@Component({
  selector: 'app-pericias',
  standalone: true,
  imports: [
    ModalAddComponent,
    ButtonComponent,
    TablePericiasComponent,
    RenderDirective,
  ],
  templateUrl: './pericias.component.html',
  styleUrl: './pericias.component.css',
})
export class PericiasComponent {
  @ViewChild('table') table!: TablePericiasComponent;

  updateTable(pericia: PericiaI) {
    this.table.getHistoric();
  }
}
