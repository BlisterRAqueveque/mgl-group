import { Component } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroExclamationTriangleSolid, heroQuestionMarkCircleSolid } from '@ng-icons/heroicons/solid';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [
    ToastModule,
    ConfirmDialogModule,
    ButtonModule,
    NgIcon,
    ProgressSpinnerModule,
    CommonModule,
  ],
  providers: [
    ConfirmationService,
    MessageService,
    provideIcons({ heroQuestionMarkCircleSolid, heroExclamationTriangleSolid }),
  ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css',
})
export class DialogComponent {
  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  /** @description Muestra el spinner */
  loading = false

  /** @description Muestra los 2 botones, o uno solo en false */
  showButtons = true

  /** @description Muestra cartel de error */
  error = false

  /** @description Muestra el dialogo de confirmación. */
  confirm(header: string, message: string, fx?: Function) {
    this.confirmationService.confirm({
      header: header,
      message: message,
      accept: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Confirma',
          detail: 'Acción confirmada',
          life: 3000,
        });
        fx!();
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Rechaza',
          detail: 'Acción rechazada',
          life: 3000,
        });
      },
    });
  }

  /** @description Muestra un dialogo de confirmación después de una acción. Detiene también el spinner */
  alertMessage(header: string, message: string, fx?: Function, error?: boolean) {
    this.loading = false
    if(error !== undefined) this.error = error
    this.showButtons = false
    this.confirmationService.confirm({
      header: header,
      message: message,
      accept: () => {
        fx!();
      }
    })
  }
}
