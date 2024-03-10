import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { ModalAddComponent } from './modal-add/modal-add.component';
import { TablePericiasComponent } from './table-pericias/table-pericias.component';

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
}
