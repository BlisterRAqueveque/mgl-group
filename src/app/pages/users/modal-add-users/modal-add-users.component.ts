import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-modal-add-users',
  standalone: true,
  imports: [
    DialogModule,
    CommonModule,
    FormsModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    InputMaskModule,
    RippleModule,
    TooltipModule,
  ],
  templateUrl: './modal-add-users.component.html',
  styleUrl: './modal-add-users.component.css',
})
export class ModalAddUsersComponent {
  tooltipText =
    'Al agregar un asesor, se crea automáticamente un usuario nuevo. Tener en cuenta de realizar las modificaciones correspondientes luego de realizado.';
  /** @description Set the visibility of the modal */
  visible = true;

  showModal() {
    this.visible = true;
  }

  dismissModal() {
    this.visible = false;
  }

  cities: any[] | undefined;

  selectedCity: any | undefined;

  ngOnInit() {
    this.cities = [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' },
    ];
  }
}
