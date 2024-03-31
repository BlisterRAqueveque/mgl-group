import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { FilterSiniestrosComponent } from './filter-siniestros/filter-siniestros.component';
import {
  heroBarsArrowUpSolid,
  heroBarsArrowDownSolid,
} from '@ng-icons/heroicons/solid';
import { HttpParams } from '@angular/common/http';
import { SiniestroService } from '../../../services/siniestros/siniestros.service';
import { CommonModule } from '@angular/common';
import { TipoSiniestroI } from '../../../interfaces/tipo-siniestro.interface';

@Component({
  selector: 'app-table-siniestros',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule,
    TooltipModule,
    NgIconComponent,
    FilterSiniestrosComponent,
    CommonModule,
  ],
  providers: [
    provideIcons({
      heroBarsArrowUpSolid,
      heroBarsArrowDownSolid,
    }),
  ],
  templateUrl: './table-siniestros.component.html',
  styleUrl: './table-siniestros.component.css',
})
export class TableSiniestrosComponent {
  constructor(private readonly siniestroService: SiniestroService) {}

  params = new HttpParams();

  ngAfterViewInit() {
    this.params = this.params.set('page', 1);
    this.params = this.params.set('perPage', 10);
    this.params = this.params.set('sortBy', 'DESC');
    this.getHistoric();
  }

  siniestros: TipoSiniestroI[] = [];

  totalRecords = 0;

  @ViewChild('table') table!: Table;
  @ViewChild('paginator') Paginator!: Paginator;

  async getHistoric() {
    this.table.loading = true;
    this.siniestroService.getAllFilter(this.params).subscribe({
      next: (data) => {
        this.siniestros = data.entities;
        this.totalRecords = data.count;
        this.table.loading = false;
      },
      error: (e) => {
        this.table.loading = false;
        console.log(e);
      },
    });
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

  onClickButton = false;

  @Output() selectedRow = new EventEmitter<TipoSiniestroI>();
  @Output() setSiniestroInactive = new EventEmitter<TipoSiniestroI>();
  onRowSelect(selectedItem: TipoSiniestroI) {
    if (this.onClickButton) {
      this.onClickButton = false;
      this.setSiniestroInactive.emit(selectedItem);
    } else this.selectedRow.emit(selectedItem);
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
