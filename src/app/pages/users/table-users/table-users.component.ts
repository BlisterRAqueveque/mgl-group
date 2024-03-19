import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroBarsArrowUpSolid,
  heroBarsArrowDownSolid,
  heroPlusCircleSolid,
} from '@ng-icons/heroicons/solid';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { FilterUsersComponent } from './filter-users/filter-users.component';
import { AsesorService } from '../../../services/asesores/asesores.service';
import { Roles, UsuarioI } from '../../../interfaces/user-token.interface';

@Component({
  selector: 'app-table-users',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule,
    TooltipModule,
    CommonModule,
    NgIconComponent,
    FilterUsersComponent,
  ],
  providers: [
    provideIcons({
      heroBarsArrowUpSolid,
      heroBarsArrowDownSolid,
      heroPlusCircleSolid,
    }),
  ],
  templateUrl: './table-users.component.html',
  styleUrl: './table-users.component.css',
})
export class TableUsersComponent {
  constructor(private readonly asesorService: AsesorService) {}

  params = new HttpParams();

  ngAfterViewInit() {
    this.params = this.params.set('page', 1);
    this.params = this.params.set('perPage', 10);
    this.params = this.params.set('sortBy', 'DESC');
    this.getHistoric();
  }

  asesores: UsuarioI[] = [];

  totalRecords = 0;

  @ViewChild('table') table!: Table;
  @ViewChild('paginator') Paginator!: Paginator;

  /** @description Obtenemos el histórico de los usuarios */
  async getHistoric() {
    this.table.loading = true;
    this.asesorService.getAllFilter(this.params).subscribe({
      next: (data) => {
        this.asesores = data.entities;
        this.totalRecords = data.count;
        this.table.loading = false;
      },
      error: (e) => {
        console.log(e);
        this.table.loading = false;
      },
    });
  }

  /** @description Obtiene los parámetros del filtro para mandar como param en las consultas */
  filter(ev: any) {
    this.params = this.params.set(ev.key, ev.value);
    this.getHistoric();
  }

  first: number = 0;

  rows: number = 10;

  /** @description Setea los params para traer información */
  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.params = this.params.set('page', event.page + 1);
    this.params = this.params.set('perPage', event.rows);
    this.getHistoric();
  }

  onClickButton = false;

  @Output() selectedRow = new EventEmitter<UsuarioI>();
  @Output() setUserInactive = new EventEmitter<UsuarioI>();
  onRowSelect(selectedItem: UsuarioI) {
    if (this.onClickButton) {
      this.onClickButton = false;
      this.setUserInactive.emit(selectedItem);
    } else this.selectedRow.emit(selectedItem);
  }

  /** @description Roles con mas información para ayuda del usuario */
  roles = [
    { name: 'Administrador', rol: Roles.admin },
    { name: 'Solo asesor', rol: Roles.user },
    { name: 'Solo visita', rol: Roles.visit },
  ];

  /** @description Un selector de onSort para mandar como param */
  asc = true;
  onSort(ev: any) {
    this.asc = !this.asc;
    switch (ev.order) {
      case 1: {
        if (this.params.get('sortBy') !== 'ASC') {
          this.params = this.params.set('sortBy', 'ASC');
          this.getHistoric();
        }
        break;
      }
      case -1: {
        if (this.params.get('sortBy') !== 'DESC') {
          this.params = this.params.set('sortBy', 'DESC');
          this.getHistoric();
        }
        break;
      }
    }
  }

  /** @description Solo retorna el rol con mas descripción */
  returnRol(userRol: string) {
    return this.roles.find((rol) => rol.rol === userRol);
  }
}
