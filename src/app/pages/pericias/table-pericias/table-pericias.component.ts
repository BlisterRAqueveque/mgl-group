import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroBarsArrowUpSolid,
  heroBarsArrowDownSolid,
} from '@ng-icons/heroicons/solid';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { FilterPericiasComponent } from './filter-pericias/filter-pericias.component';
import { PericiaService } from '../../../services/pericias/pericias.service';
import { CommonModule, formatDate } from '@angular/common';
import { PericiaI } from '../../../interfaces/pericia.interface';

@Component({
  selector: 'app-table-pericias',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    TooltipModule,
    NgIconComponent,
    FilterPericiasComponent,
  ],
  providers: [
    provideIcons({
      heroBarsArrowUpSolid,
      heroBarsArrowDownSolid,
    }),
  ],
  templateUrl: './table-pericias.component.html',
  styleUrl: './table-pericias.component.css',
})
export class TablePericiasComponent {
  constructor(private readonly periciaService: PericiaService) {}

  params = new HttpParams();

  ngAfterViewInit() {
    this.params = this.params.set('page', 1);
    this.params = this.params.set('perPage', 10);
    this.params = this.params.set('sortBy', 'DESC');
    this.getHistoric();
  }

  pericias: PericiaI[] = [];

  totalRecords = 0;

  @ViewChild('table') table!: Table;
  @ViewChild('paginator') Paginator!: Paginator;

  async getHistoric() {
    this.table.loading = true;
    this.periciaService.getAllFilter(this.params).subscribe({
      next: (data) => {
        this.pericias = data.entities;
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

  @Output() selectedRow = new EventEmitter<PericiaI>();
  @Output() setAseguradoraInactive = new EventEmitter<PericiaI>();
  onRowSelect(selectedItem: PericiaI) {
    if (this.onClickButton) {
      this.onClickButton = false;
      this.setAseguradoraInactive.emit(selectedItem);
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
