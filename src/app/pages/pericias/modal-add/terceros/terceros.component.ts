import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { DialogComponent } from '../../../../shared/dialog/dialog.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroTrashSolid } from '@ng-icons/heroicons/solid';

@Component({
  selector: 'app-terceros',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    RippleModule,
    DialogComponent,
    NgIcon,
  ],
  providers: [
    provideIcons({
      heroTrashSolid,
    }),
  ],
  templateUrl: './terceros.component.html',
  styleUrl: './terceros.component.css',
})
export class TercerosComponent {
  @Input() readonly = false;
  @Input() id!: number;
  @Input() nombre!: string;
  @Input() dni!: string;
  @Input() aseguradora!: string;

  @ViewChild('dialog') dialog!: DialogComponent;
  @Output() delete = new EventEmitter<boolean>();
  onDelete() {
    this.dialog.confirm(
      '¿Está seguro de borrar esta información?',
      'Confirmar',
      () => {
        this.delete.emit(true);
      }
    );
  }
}
