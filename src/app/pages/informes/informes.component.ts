import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowUturnLeftSolid,
  heroArrowUturnRightSolid,
  heroEyeSolid,
  heroPencilSquareSolid,
  heroPlusCircleSolid,
  heroTrashSolid,
  heroMagnifyingGlassSolid,
} from '@ng-icons/heroicons/solid';
import {
  ImageCroppedEvent,
  ImageCropperModule,
  ImageTransform,
} from 'ngx-image-cropper';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { PericiaI } from '../../interfaces/pericia.interface';
import { ButtonComponent } from '../../shared/button/button.component';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { TablePericiasInformesComponent } from './table-pericias-informes/table-pericias-informes.component';
import { AdjuntoI, InformeI } from '../../interfaces/informe.interface';
import { AuthService } from '../../services/auth/auth.service';
import { dataURLtoFile } from '../../tools/img-url-to-file';
import { InformeService } from '../../services/informes/informe.service';
import { environment } from '../../../environments/environment';
import { imgToBase64 } from '../../tools/img-to-url';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [
    ImageCropperModule,
    CommonModule,
    NgIconComponent,
    TooltipModule,
    DialogModule,
    RippleModule,
    InputTextModule,
    InputTextareaModule,
    CheckboxModule,
    FormsModule,
    DragDropModule,
    DialogComponent,
    ButtonComponent,
    TablePericiasInformesComponent,
  ],
  templateUrl: './informes.component.html',
  styleUrl: './informes.component.css',
  providers: [
    provideIcons({
      heroEyeSolid,
      heroArrowUturnLeftSolid,
      heroArrowUturnRightSolid,
      heroPencilSquareSolid,
      heroTrashSolid,
      heroPlusCircleSolid,
      heroMagnifyingGlassSolid,
    }),
  ],
})
export class InformesComponent {
  constructor(
    private readonly auth: AuthService,
    private readonly informeService: InformeService
  ) {}

  //TODO La idea es traer de la base de datos un informe existente. La relación es 1x1
  //TODO Falta un botón para pre visualizar el informe terminado
  @ViewChild('dialog') dialog!: DialogComponent;

  poliza!: boolean;
  cobertura!: boolean;
  anio!: boolean;
  patente!: boolean;

  /** @description Muestra el modal con los informes */
  visibleInforme = false;

  /** @description Muestra nuevamente el modal de selección */
  selectPericia() {
    if (!this.pericia) {
      this.visibleInforme = true;
    } else {
      this.dialog.confirm(
        'Revisar antes de continuar',
        'Si cambia de pericia, toda la información cargada se va a eliminar, ¿Desea continuar?',
        () => {
          this.visibleInforme = true;
        }
      );
    }
  }

  /** @description Vacía todos los campos */
  setDefault() {
    this.pericia = null;
    this.images = [];
    this.hecho = '';
    this.n_poliza = '';
    this.tipo_cobertura = '';
    this.amp_denuncia = '';
    this.conclusion = '';
    this.tipo_siniestro = '';
    this.n_siniestro = '';
    this.n_denuncia = '';
    this.nombre_asegurado = '';
    this.dir_asegurado = '';
    this.tel_asegurado = '';
    this.veh_asegurado = '';
    this.patente_asegurado = '';
    this.text_anio = '';
  }
  // ---------------------------------------------------------------------------->
  /**                           Inicializar el modulo                           */

  /** @description Estos vienen directo del objeto */
  tipo_siniestro!: string;
  n_siniestro!: string;
  n_denuncia!: string;
  nombre_asegurado!: string;
  dir_asegurado!: string;
  tel_asegurado!: string;
  veh_asegurado!: string;
  patente_asegurado!: string;

  /** @description Estos son para completar el objeto */
  hecho!: string;
  n_poliza!: string;
  tipo_cobertura!: string;
  amp_denuncia!: string;
  conclusion!: string;
  text_anio!: string;

  async initModule(pericia: PericiaI) {
    console.log(pericia.informe?.adjuntos)
    //* Si la pericia no tiene un informe asignado, debe crear uno nuevo
    if (!pericia.informe) {
      this.tipo_siniestro = pericia.tipo_siniestro?.nombre!;
      this.n_siniestro = pericia.n_siniestro?.toString()!;
      this.n_denuncia = pericia.n_denuncia?.toString()!;
      this.nombre_asegurado = pericia.nombre_asegurado;
      this.dir_asegurado = pericia.dir_asegurado;
      this.tel_asegurado = pericia.tel_asegurado;
      this.veh_asegurado = pericia.veh_asegurado;
      this.patente_asegurado = pericia.patente_asegurado;
    } else {
      this.tipo_siniestro = pericia.informe.tipo_siniestro;
      this.n_siniestro = pericia.informe.n_siniestro;
      this.n_denuncia = pericia.informe.n_denuncia;
      this.nombre_asegurado = pericia.informe.nombre_asegurado;
      this.dir_asegurado = pericia.informe.dir_asegurado;
      this.tel_asegurado = pericia.informe.tel_asegurado;
      this.veh_asegurado = pericia.informe.veh_asegurado;
      this.patente_asegurado = pericia.informe.patente_asegurado;
      this.hecho = pericia.informe.hecho;
      this.n_poliza = pericia.informe.n_poliza;
      this.tipo_cobertura = pericia.informe.tipo_cobertura;
      this.amp_denuncia = pericia.informe.amp_denuncia;
      this.conclusion = pericia.informe.conclusion;
      this.text_anio = pericia.informe.text_anio;
      const url = environment.imagesUrl;
      for (const a of pericia.informe.adjuntos) {
        const img = await imgToBase64(url + a.adjunto);
        this.images.push({
          img: img as string,
          comment: a.descripcion,
          mimeType: 'image/jpeg',
          originalImg: img as string
        })
      }
    }
    //? El objeto completo para tener referencia mas tarde
    this.pericia = pericia;
    this.visibleInforme = false;
  }
  // ---------------------------------------------------------------------------->

  // ---------------------------------------------------------------------------->
  /**                            Sección de imágenes                            */

  /** @description Lista de imágenes, contiene la imagen que se muestra/guarda, y la original */
  images: {
    img: string;
    comment: string;
    mimeType: string;
    originalImg: string;
  }[] = [];

  /** @description Toma la imagen desde el evento y la transforma en base64 */
  async addImage(event: any, input: HTMLInputElement) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target!.result !== null ? e.target!.result : '';
      //* Se almacenan en la lista
      this.images.push({
        img: imageUrl.toString(),
        comment: '',
        mimeType: 'image/jpeg',
        originalImg: imageUrl.toString(),
      });
    };
    reader.readAsDataURL(event.target.files[0]);
    input.value = '';
  }

  /** @description Controla el estado del dialog */
  visible = false;
  /** @description la imagen que se muestra en el cropper */
  imageToEdit!: any;
  /** @description El index de la imagen original */
  imgIndex!: number;

  /** @description Toma la imagen original, y la manda al cropper para comenzar a editarla */
  editImage(index: number) {
    this.imageToEdit = this.images[index].originalImg;
    //* Almacenamos el index para editar el registro en la lista
    this.imgIndex = index;
    this.visible = true;
  }

  /** @description Sirven para manejar el canvas donde está almacenada la imagen */
  canvasRotation = 0;
  transform: ImageTransform = {};

  /** @description Rotamos la imagen a la izquierda */
  rotateLeft() {
    this.canvasRotation--;
    this.flipAfterRotate();
  }
  /** @description Rotamos la imagen a la derecha */
  rotateRight() {
    this.canvasRotation++;
    this.flipAfterRotate();
  }
  /** @description Se usa antes de realizar la rotación para ajustar la imagen */
  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH,
    };
  }

  /** @description Almacena los cambios de la imagen editada */
  imgResult!: any;
  /** @description Va guardando los cambios de la imagen editada */
  imageCropped(img: ImageCroppedEvent) {
    const reader = new FileReader();
    reader.onload = (event) => {
      this.imgResult = event.target?.result as string;
    };
    reader.readAsDataURL(img.blob!);
    this.imgResult = img.base64;
  }

  /**
   * @description Finaliza la edición de la imagen, guarda el resultado solo donde se
   * almacena la imagen que se va a mostrar. La original queda intacta, en caso de
   * necesitar realizar mas cambios
   **/
  finishImgEdition() {
    this.images[this.imgIndex].img = this.imgResult;
    this.visible = false;
  }

  /** @description Borra la imagen seleccionada */
  deleteImg(index: number) {
    this.dialog.confirm(
      'Tratar con cuidado.',
      '¿Realmente desea eliminar la imagen seleccionada? Esta acción es irreversible.',
      () => {
        this.images.splice(index, 1);
      }
    );
  }

  /** @description Retorna el objeto arrastrado en un evento */
  moveImg(
    dropEvent: CdkDragDrop<
      {
        img: string;
        comment: string;
        mimeType: string;
        originalImg: string;
      }[]
    >
  ) {
    //! Accedemos a las propiedades del objeto => dropEvent.container.data
    const { container, previousIndex, currentIndex } = dropEvent;
    if (previousIndex === currentIndex) return;
    this.reorderImages(container.data, previousIndex, currentIndex);
  }
  /** @description Reordena la lista, son funciones del mismo componente importado */
  reorderImages(
    data: {
      img: string;
      comment: string;
      mimeType: string;
      originalImg: string;
    }[],
    previousIndex: number,
    currentIndex: number
  ) {
    moveItemInArray(data, previousIndex, currentIndex);
    console.log(this.images);
  }
  // ---------------------------------------------------------------------------->

  // ---------------------------------------------------------------------------->
  /**                           Sección carga informes                          */
  pericia!: PericiaI | null;

  /** @description Muestra el dialogo de confirmación de carga */
  onUploadInforme() {
    if (this.pericia) {
      this.dialog.confirm(
        'Confirmación de carga',
        '¿Está seguro/a de cargar el informe creado? El mismo se le asignará a la pericia seleccionada.',
        () => {
          this.uploadInforme();
        }
      );
    } else {
      this.dialog.alertMessage(
        'Error de carga',
        'No se selecciono ninguna pericia, no se puede continuar',
        () => {},
        true
      );
    }
  }

  /** @description Carga el informe finalizado */
  async uploadInforme() {
    const formData = new FormData();
    const adjuntos: AdjuntoI[] = [];
    this.images.forEach((img, index) => {
      formData.append('files', dataURLtoFile(img.img, 'newFile', img.mimeType));
      adjuntos.push({
        adjunto: '',
        descripcion: img.comment,
        index,
      });
    });
    const user = await this.auth.returnUserInfo();
    const informe: InformeI = {
      tipo_siniestro: this.tipo_siniestro,
      n_siniestro: this.n_siniestro,
      n_denuncia: this.n_denuncia,
      nombre_asegurado: this.nombre_asegurado,
      dir_asegurado: this.dir_asegurado,
      tel_asegurado: this.tel_asegurado,
      veh_asegurado: this.veh_asegurado,
      patente_asegurado: this.patente_asegurado,
      hecho: this.hecho,
      n_poliza: this.n_poliza,
      tipo_cobertura: this.tipo_cobertura,
      amp_denuncia: this.amp_denuncia,
      conclusion: this.conclusion,
      text_anio: this.text_anio,
      adjuntos: adjuntos,
      usuario_carga: user!,
      pericia: this.pericia!,
    };
    formData.append('form', JSON.stringify(informe));
    this.informeService.insert(formData).subscribe({
      next: (data) => {
        console.log(data);
        this.dialog.alertMessage(
          'Confirmación de carga',
          'El informe se cargó con éxito.',
          () => {
            this.setDefault();
          }
        );
      },
      error: (e) => {
        console.log(e);
        this.dialog.alertMessage(
          'Error de carga',
          'Ocurrió un error en la carga.',
          () => {},
          true
        );
      },
    });
  }
  // ---------------------------------------------------------------------------->
}
