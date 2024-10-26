import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { RenderDirective } from '../../../../directives/render.directive';
import { FilterService } from './filter.service';
import { HttpParams } from '@angular/common/http';
import { UsuarioI } from '../../../../interfaces/user-token.interface';
import { AseguradoraI } from '../../../../interfaces/aseguradora.interface';

@Component({
  selector: 'app-filter-pericias',
  standalone: true,
  imports: [
    FormsModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    RenderDirective,
  ],
  templateUrl: './filter-pericias.component.html',
  styleUrl: './filter-pericias.component.css',
})
export class FilterPericiasComponent {
  private readonly service = inject(FilterService);

  verificadores: UsuarioI[] = [];
  selectedVerificador!: UsuarioI;
  aseguradoras: AseguradoraI[] = [];
  selectedAseguradora!: AseguradoraI;

  ngOnInit() {
    this.service.getFilterData().subscribe((data) => {
      this.verificadores = data.verificadores;
      this.verificadores.forEach((v) => {
        v.nombre_completo = `${v.nombre} ${v.apellido}`;
      });
      this.aseguradoras = data.aseguradoras;
    });
  }

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
