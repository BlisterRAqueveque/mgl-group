import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroBarsArrowDownSolid,
  heroBarsArrowUpSolid,
} from '@ng-icons/heroicons/solid';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { PericiaI } from '../../../interfaces/pericia.interface';
import { Roles, UsuarioI } from '../../../interfaces/user-token.interface';
import { AuthService } from '../../../services/auth/auth.service';
import { PericiaService } from '../../../services/pericias/pericias.service';

@Component({
  selector: 'app-table-pericias-informes',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      heroBarsArrowUpSolid,
      heroBarsArrowDownSolid,
    }),
  ],
  templateUrl: './table-pericias-informes.component.html',
  styleUrl: './table-pericias-informes.component.css',
})
export class TablePericiasInformesComponent {
  constructor(
    private readonly periciaService: PericiaService,
    private readonly auth: AuthService
  ) {}

  user!: UsuarioI | null;

  params = new HttpParams();

  async ngAfterViewInit() {
    this.user = await this.auth.returnUserInfo();
    this.params = this.params.set('page', 1);
    this.params = this.params.set('perPage', 10);
    this.params = this.params.set('sortBy', 'DESC');
    this.params = this.params.set('activo', 1);
    if (this.user?.rol !== Roles.admin)
      this.params = this.params.set('verificador', this.user?.id!);
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
        console.error(e);
      },
    });
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

  @Output() selectedItem = new EventEmitter<PericiaI>();
  onRowSelect(selectedItem: PericiaI) {
    this.selectedItem.emit(selectedItem);
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
