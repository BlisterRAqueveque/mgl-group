import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { DialogComponent } from '../../../../shared/dialog/dialog.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroTrashSolid } from '@ng-icons/heroicons/solid';
import { AccordionModule } from 'primeng/accordion';
import { AttachmentsComponent } from '../attachments/attachments.component';
import { Images } from '../../../../interfaces/images.interface';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TerceroI } from '../../../../interfaces/pericia.interface';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-terceros-informe',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    RippleModule,
    DialogComponent,
    AccordionModule,
    NgIcon,
    InputTextareaModule,
    AttachmentsComponent,
    CheckboxModule,
  ],
  providers: [
    provideIcons({
      heroTrashSolid,
    }),
  ],
  templateUrl: './terceros.component.html',
  styleUrl: './terceros.component.css',
})
export class TercerosInformeComponent {
  @Input() readonly = false;
  @Input() id!: number;
  @Input() nombre!: string;
  @Input() domicilio!: string;
  @Input() tel!: string;
  @Input() veh!: string;
  @Input() patente!: string;
  @Input() amp_denuncia!: string;
  @Input() aseguradora!: string;
  @Input() email!: string;

  @Input() tercero!: TerceroI;

  @Input() anio!: number;
  @Input() poliza!: string;
  @Input() cobertura!: string;

  documents: Images[] = [];
  car: Images[] = [];

  hasAmpDenuncia = true;
  retDenuncia = false;
  tipoAmpDenuncia = 'Ampliación de denuncia';
  @ViewChild('dialog') dialog!: DialogComponent;
  @Output() delete = new EventEmitter<boolean>();
  onDelete() {
    this.dialog.confirm(
      '¿Está seguro de borrar esta información?',
      'Confirmar',
      () => {
        this.delete.emit(true);
      }
    );
  }

  setList(img_list: Images[], type: string) {
    switch (type) {
      case 'documents': {
        if (img_list.length > 0) {
          img_list.forEach((d, i) => {
            if (img_list.length > 0 && this.hasAmpDenuncia) {
              switch (i) {
                case 0: {
                  d.comment = this.tipoAmpDenuncia;
                  break;
                }
                case 1: {
                  d.comment = 'DNI anverso';
                  break;
                }
                case 2: {
                  d.comment = 'DNI reverso';
                  break;
                }
                case 3: {
                  d.comment = 'Carnet de conducir anverso';
                  break;
                }
                case 4: {
                  d.comment = 'Carnet de conducir reverso';
                  break;
                }
                case 5: {
                  d.comment = 'Cédula verde anverso';
                  break;
                }
                case 6: {
                  d.comment = 'Cédula verde reverso';
                  break;
                }
                default: {
                  img_list.pop();
                  this.dialog.alertMessage(
                    'No disponible',
                    '¡No se pueden cargar mas imágenes en esta sección!',
                    () => {},
                    true
                  );
                }
              }
            } else if (img_list.length > 0 && !this.hasAmpDenuncia) {
              img_list.forEach((d, i) => {
                switch (i) {
                  case 0: {
                    d.comment = 'DNI anverso';
                    break;
                  }
                  case 1: {
                    d.comment = 'DNI reverso';
                    break;
                  }
                  case 2: {
                    d.comment = 'Carnet de conducir anverso';
                    break;
                  }
                  case 3: {
                    d.comment = 'Carnet de conducir reverso';
                    break;
                  }
                  case 4: {
                    d.comment = 'Cédula verde anverso';
                    break;
                  }
                  case 5: {
                    d.comment = 'Cédula verde reverso';
                    break;
                  }
                  default: {
                    img_list.pop();
                    this.dialog.alertMessage(
                      'No disponible',
                      '¡No se pueden cargar mas imágenes en esta sección!',
                      () => {},
                      true
                    );
                  }
                }
              });
            }
          });
        }
        break;
      }
      case 'asegurado-auto': {
        if (img_list.length > 0) {
          img_list.forEach((d, i) => {
            switch (i) {
              case 0: {
                d.comment = 'Frente lateral izquierdo';
                break;
              }
              case 1: {
                d.comment = 'Frente lateral derecho';
                break;
              }
              case 2: {
                d.comment = 'Trasera lateral izquierdo';
                break;
              }
              case 3: {
                d.comment = 'Trasera lateral derecho';
                break;
              }
              default: {
                img_list.pop();
                this.dialog.alertMessage(
                  'No disponible',
                  '¡No se pueden cargar mas imágenes en esta sección!',
                  () => {},
                  true
                );
              }
            }
          });
        }
        break;
      }
    }
  }
}
