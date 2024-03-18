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
import { UsuarioI } from '../../../interfaces/user-token.interface';

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

  async getHistoric() {
    this.table.loading = true;
    this.asesorService.getAllFilter(this.params).subscribe({
      next: data => {
        this.asesores = data.entities
        this.totalRecords = data.count
        this.table.loading = false
      },
      error: e => {
        console.log(e)
        this.table.loading = false
      }
    })
  }

  filter(ev: any) {
    this.params = this.params.set(ev.key, ev.value);
    this.getHistoric();
  }

  first: number = 0;

  rows: number = 10;

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.params = this.params.set('page', event.page + 1);
    this.params = this.params.set('perPage', event.rows);
    this.getHistoric();
  }

  @Output() selectedRow = new EventEmitter<any>();
  onRowSelect(selectedItem: any) {
    this.selectedRow.emit(selectedItem);
  }

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
}
