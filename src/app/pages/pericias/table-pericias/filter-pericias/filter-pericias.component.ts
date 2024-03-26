import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-filter-pericias',
  standalone: true,
  imports: [FormsModule, DropdownModule, CalendarModule, InputTextModule],
  templateUrl: './filter-pericias.component.html',
  styleUrl: './filter-pericias.component.css',
})
export class FilterPericiasComponent {
  option: any;
  open_list = [
    { label: 'Abierto', value: 1 },
    { label: 'Cerrado', value: 0 },
  ];

  @Output('changeInput') private event = new EventEmitter<{
    key: string;
    value: string;
  }>();

  changeInput(key: string, value: string) {
    if (key === 'year' && value !== '') {
      value = new Date(value).getFullYear().toString();
    }
    this.event.emit({ key: key, value: value });
  }
}
