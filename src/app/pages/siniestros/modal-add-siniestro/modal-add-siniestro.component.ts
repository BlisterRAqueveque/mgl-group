import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-modal-add-siniestro',
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
  ],
  templateUrl: './modal-add-siniestro.component.html',
  styleUrl: './modal-add-siniestro.component.css',
})
export class ModalAddSiniestroComponent {
  /** @description Set the visibility of the modal */
  visible = false;

  showModal() {
    this.visible = true;
  }

  dismissModal() {
    this.visible = false;
  }
}
