import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-filter-siniestros',
  standalone: true,
  imports: [
    InputTextModule,
    CalendarModule,
    FormsModule,
    CommonModule,
    DropdownModule,
  ],
  templateUrl: './filter-siniestros.component.html',
  styleUrl: './filter-siniestros.component.css',
})
export class FilterSiniestrosComponent {
  @Output('changeInput') private event = new EventEmitter<{
    key: string;
    value: string;
  }>();

  option: any;
  open_list = [
    { label: 'Abierto', value: true },
    { label: 'Cerrado', value: false },
  ];

  changeInput(key: string, value: string) {
    if (key === 'year' && value !== '') {
      value = new Date(value).getFullYear().toString();
    }
    this.event.emit({ key: key, value: value });
  }
}
