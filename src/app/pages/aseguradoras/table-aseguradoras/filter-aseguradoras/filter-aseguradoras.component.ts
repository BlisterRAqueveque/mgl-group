import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-filter-aseguradoras',
  standalone: true,
  imports: [InputTextModule, CalendarModule, FormsModule, CommonModule],
  templateUrl: './filter-aseguradoras.component.html',
  styleUrl: './filter-aseguradoras.component.css',
})
export class FilterAseguradorasComponent {
  @Output('changeInput') private event = new EventEmitter<{
    key: string;
    value: string;
  }>();

  date: Date[] | undefined;

  open_list = [
    { label: 'Abierto', value: '1' },
    { label: 'Cerrado', value: '0' },
  ];

  changeInput(key: string, value: string) {
    if (key === 'year' && value !== '') {
      value = new Date(value).getFullYear().toString();
    }
    this.event.emit({ key: key, value: value });
  }
}
