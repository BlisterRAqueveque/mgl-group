import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowDownOnSquareSolid,
  heroArrowUturnLeftSolid,
  heroArrowUturnRightSolid,
  heroArrowsPointingOutSolid,
  heroDocumentSolid,
  heroEyeSolid,
  heroMagnifyingGlassSolid,
  heroPencilSquareSolid,
  heroPlusCircleSolid,
  heroTrashSolid,
} from '@ng-icons/heroicons/solid';
import {
  ImageCroppedEvent,
  ImageCropperModule,
  ImageTransform,
} from 'ngx-image-cropper';
import * as pdfMake from 'pdfmake/build/pdfmake';
import {
  Content,
  ContentStack,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdjuntoI,
  InformeI,
  originalDots,
} from '../../interfaces/informe.interface';
import { PericiaI, TerceroI } from '../../interfaces/pericia.interface';
import { InformeService } from '../../services/informes/informe.service';
import { PericiaService } from '../../services/pericias/pericias.service';
import { ButtonComponent } from '../../shared/button/button.component';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { convertFileToBase64 } from '../../tools/file-to-base64';
import { compareDimensions, getImageHeight } from '../../tools/image-height';
import { imgToBase64 } from '../../tools/img-to-url';
import { dataURLtoFile } from '../../tools/img-url-to-file';
import { TablePericiasInformesComponent } from './table-pericias-informes/table-pericias-informes.component';
import { AuthService } from '../../services/auth/auth.service';
import { TercerosComponent } from '../pericias/modal-add/terceros/terceros.component';
import { DropdownModule } from 'primeng/dropdown';

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
    TercerosComponent,
    DropdownModule,
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
      heroDocumentSolid,
      heroArrowsPointingOutSolid,
      heroArrowDownOnSquareSolid,
    }),
  ],
})
export class InformesComponent {
  constructor(
    private readonly auth: AuthService,
    private readonly informeService: InformeService,
    private readonly route: ActivatedRoute,
    private readonly periciaService: PericiaService
  ) {}

  /** @description Revisamos los params para ver si no enviaron desde otro lugar el id de la pericia */
  async ngAfterViewInit() {
    const id = await firstValueFrom(this.route.queryParams);
    if (id['pericia']) {
      this.dialog.loading = true;
      this.periciaService.getOne(id['pericia'] as number).subscribe({
        next: (data) => {
          this.dialog.loading = false;
          if (!data.informe) {
            this.dialog.alertMessage(
              'Aviso.',
              'Esta pericia no tiene un informe cargado',
              () => {}
            );
          }
          if (data.abierta === true) this.pericia = data;
          this.initModule(data);
        },
        error: (e) => {
          this.dialog.alertMessage(
            'Error de búsqueda.',
            'No se encontró la pericia, o algo salió mal con el servidor.',
            () => {},
            true
          );
          console.log(e);
        },
      });
    }
  }

  @ViewChild('dialog') dialog!: DialogComponent;
  @ViewChild('table') table!: TablePericiasInformesComponent;

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
    this.relevamiento = '';
    this.conductor = '';
    this.dni_conductor = '';
    this.tercerosContainer.clear();
    this.hasTerceros = false;
    this.isRoboRueda = false;
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
  relevamiento!: string;

  /** @description Si la pericia está cerrada, muestra el cartel */
  close = false;

  hasTerceros = false;
  conductor = '';
  dni_conductor = '';

  isRoboRueda = false;

  async initModule(pericia: PericiaI) {
    this.dialog.loading = true;
    this.close = false;
    this.hasTerceros = pericia.tipo_siniestro
      ? pericia.tipo_siniestro.nombre!.includes('vial')!
      : false;
    this.isRoboRueda = pericia.tipo_siniestro
      ? pericia.tipo_siniestro.nombre!.includes('rueda')!
      : false;
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
      this.conductor = pericia.conductor!;
      this.dni_conductor = pericia.dni_conductor!;
      this.initComponent(pericia.terceros);
    } else {
      this.tipo_siniestro = pericia.informe.tipo_siniestro;
      this.n_siniestro = pericia.informe.n_siniestro;
      this.n_denuncia = pericia.informe.n_denuncia;
      this.nombre_asegurado = pericia.informe.nombre_asegurado;
      this.dir_asegurado = pericia.informe.dir_asegurado;
      this.tel_asegurado = pericia.informe.tel_asegurado;
      this.veh_asegurado = pericia.informe.veh_asegurado;

      this.patente_asegurado = pericia.informe.patente_asegurado;
      this.patente = this.patente_asegurado === '';

      this.hecho = pericia.informe.hecho;

      this.n_poliza = pericia.informe.n_poliza;
      this.poliza = this.n_poliza === '';

      this.tipo_cobertura = pericia.informe.tipo_cobertura;
      this.cobertura = this.tipo_cobertura === '';

      this.amp_denuncia = pericia.informe.amp_denuncia;
      this.conclusion = pericia.informe.conclusion;

      this.text_anio = pericia.informe.text_anio;
      this.anio = this.text_anio === '';

      this.relevamiento = pericia.informe.relevamiento;

      this.conductor = pericia.informe.conductor!;
      this.dni_conductor = pericia.informe.dni_conductor!;

      const url = environment.imagesUrl;
      this.initComponent(pericia.informe.terceros);
      for (const a of pericia.informe.adjuntos) {
        const img = await imgToBase64(url + a.adjunto);
        this.images.push({
          id: a?.id!,
          img: img as string,
          dot: this.setDots(a.dot),
          comment: a.descripcion,
          mimeType: 'image/jpeg',
          originalImg: img as string,
          edited: false,
        });
      }
      this.selectDot();
    }

    //? El objeto completo para tener referencia mas tarde
    if (pericia.abierta === true) this.pericia = pericia;
    else this.close = true;
    this.visibleInforme = false;

    this.dialog.loading = false;
  }
  // ---------------------------------------------------------------------------->

  // ---------------------------------------------------------------------------->
  /**                            Sección de imágenes                            */

  /** @description Lista de imágenes, contiene la imagen que se muestra/guarda, y la original */
  images: {
    id: number;
    img: string;
    comment: string;
    dot: { name: string; code: string } | undefined;
    mimeType: string;
    originalImg: string;
    edited: boolean;
  }[] = [];

  /** @description Toma la imagen desde el evento y la transforma en base64 */
  async addImage(event: any, input: HTMLInputElement) {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target!.result !== null ? e.target!.result : '';
          //* Se almacenan en la lista
          this.images.push({
            id: 0,
            img: imageUrl.toString(),
            dot: undefined,
            comment: '',
            mimeType: 'image/jpeg',
            originalImg: imageUrl.toString(),
            edited: false,
          });
        };
        reader.readAsDataURL(file);
      }
    }
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
    this.images[this.imgIndex].edited = true;
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
        id: number;
        img: string;
        comment: string;
        dot: { name: string; code: string } | undefined;
        mimeType: string;
        originalImg: string;
        edited: boolean;
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
    this.dialog.loading = true;
    const formData = new FormData();
    const adjuntos: AdjuntoI[] = [];
    this.images.forEach((img, index) => {
      formData.append('files', dataURLtoFile(img.img, 'newFile', img.mimeType));
      adjuntos.push({
        adjunto: '',
        dot: img.dot?.code,
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
      relevamiento: this.relevamiento,
      pericia: this.pericia!,
      terceros: this.tercerosList(),
      conductor: this.hasTerceros ? this.conductor : '',
      dni_conductor: this.hasTerceros ? this.dni_conductor : '',
    };
    formData.append('form', JSON.stringify(informe));
    this.informeService.insert(formData).subscribe({
      next: (data) => {
        this.table.getHistoric();
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

  async onUpdateInforme() {
    this.dialog.confirm(
      'Confirmación de carga',
      '¿Está seguro de querer modificar el siguiente informe?',
      async () => {
        await this.updateInforme();
      }
    );
  }
  async updateInforme() {
    this.dialog.loading = true;
    const formData = new FormData();
    const editedImages: AdjuntoI[] = [];
    this.images.forEach((img, index) => {
      //* Si la imagen fue editada
      if (img.id === 0) {
        formData.append(
          'files',
          dataURLtoFile(img.img, 'newFile', img.mimeType)
        );
        editedImages.push({
          adjunto: '',
          dot: img.dot?.code,
          descripcion: img.comment,
          index,
        });
      }
      if (img.edited && img.id !== 0) {
        formData.append(
          'files',
          dataURLtoFile(img.img, 'newFile', img.mimeType)
        );
        //? Creamos un nuevo registro
        editedImages.push({
          adjunto: '',
          dot: img.dot?.code,
          descripcion: img.comment,
          index,
        });
        //! Quitamos el adjunto editado para que se elimine de la base de datos
        // if (
        //   this.pericia &&
        //   this.pericia.informe &&
        //   this.pericia.informe.adjuntos
        // ) {
        //   this.pericia.informe.adjuntos =
        //     this.pericia?.informe?.adjuntos.filter((i) => {
        //       return i.id !== img.id;
        //     });
        // }
      } else {
        //* Caso contrario, solo modificamos estas propiedades
        const ad = this.pericia?.informe?.adjuntos.find((i) => i.id === img.id);
        if (ad) {
          ad.index = index;
          ad.descripcion = img.comment;
          ad.dot = img.dot?.code;
          editedImages.push(ad);
        }
      }
    });
    const user = await this.auth.returnUserInfo();
    const informe: InformeI = {
      id: this.pericia?.informe?.id,
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
      adjuntos: editedImages,
      usuario_carga: user!,
      relevamiento: this.relevamiento,
      pericia: this.pericia!,
      terceros: this.tercerosList(),
      conductor: this.hasTerceros ? this.conductor : '',
      dni_conductor: this.hasTerceros ? this.dni_conductor : '',
    };
    formData.append('form', JSON.stringify(informe));
    this.informeService.update(this.pericia?.informe?.id!, formData).subscribe({
      next: (data) => {
        this.table.getHistoric();
        this.dialog.alertMessage(
          'Confirmación de carga',
          'El informe se modificó con éxito.',
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
  // --------------------------------------------------------------------------->
  /**                              Sección de PDF                              */

  async viewPdf() {
    const content = await this.firstPage();
    const contentAmpDenuncia = await this.ampDenuncia();
    const contentImg = await this.imagesPage();
    const conclusion = await this.lastPage();
    const pM = pdfMake;
    pM.fonts = {
      // download default Roboto font from cdnjs.com
      Roboto: {
        normal:
          'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        italics:
          'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
        bolditalics:
          'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
      },
    };
    const dd: TDocumentDefinitions = {
      content: [
        ...content,
        ...contentAmpDenuncia,
        ...contentImg,
        ...conclusion,
      ],
      //! Footer del PDF ---------------------------------------------------------->
      footer: function (currentPage, pageCount) {
        return {
          text: currentPage.toString() + ' de ' + pageCount,
          alignment: 'center',
        };
      },
      //! Esto es el margin de la página, y el canvas de la línea que lo redea
      //pageMargins: [20, 70, 20, 35], // [left, top, right, bottom]
      pageMargins: [20, 50, 20, 35], // [left, top, right, bottom]
      background: function (currentPage) {
        return {
          canvas: [
            {
              type: 'rect',
              x: 20,
              y: 20,
              w: 557, // A4 width in PDF units
              h: 802, // A4 height in PDF units
              lineWidth: 1,
              lineColor: '#000',
            },
          ],
        };
      },
    };
    pdfMake.createPdf(dd, undefined, pdfMake.fonts).open();
  }

  //! La página principal
  async firstPage() {
    const img = await imgToBase64(`${environment.webUrl}assets/logo.png`);
    const content: Content = [
      {
        stack: [
          {
            image: img!,
            width: 300,
            alignment: 'center',
            margin: [0, 0, 0, 50], // [left, top, right, bottom]
          },
        ],
      },
      {
        stack: [
          {
            text: 'Informe de investigación',
            decoration: 'underline',
            alignment: 'center',
            fontSize: 20,
            margin: [0, 0, 0, 10],
          },
        ],
      },
      {
        stack: [
          {
            text: this.tipo_siniestro,
            alignment: 'center',
            fontSize: 14,
            margin: [0, 0, 0, 10],
          },
        ],
      },
      {
        stack: [
          {
            text: this.hecho,
            alignment: 'center',
            fontSize: 14,
            margin: [0, 0, 0, 10],
          },
        ],
      },
      {
        stack: [
          {
            text: `N° de siniestro: ${
              this.n_siniestro ? this.n_siniestro : 'No tiene'
            }`,
            alignment: 'left',
            fontSize: 14,
            margin: [14, 0, 0, 8],
          },
        ],
      },
      {
        stack: [
          {
            text: `N° de denuncia: ${
              this.n_denuncia ? this.n_denuncia : 'No tiene'
            }`,
            alignment: 'left',
            fontSize: 14,
            margin: [14, 0, 0, 8],
          },
        ],
      },
      {
        stack: [
          {
            text: 'Datos del asegurado',
            alignment: 'center',
            fontSize: 16,
            margin: [14, 0, 0, 10],
          },
        ],
      },
      {
        stack: [
          {
            text: `Asegurado: ${
              this.nombre_asegurado ? this.nombre_asegurado : 'No se proveyó'
            }`,
            alignment: 'left',
            fontSize: 14,
            margin: [14, 0, 0, 8],
          },
        ],
      },
      {
        stack: [
          {
            text: `Domicilio: ${
              this.dir_asegurado ? this.dir_asegurado : 'No se proveyó'
            }`,
            alignment: 'left',
            fontSize: 14,
            margin: [14, 0, 0, 8],
          },
        ],
      },
      {
        stack: [
          {
            text: `Teléfono: ${
              this.tel_asegurado ? this.tel_asegurado : 'No se proveyó'
            }`,
            alignment: 'left',
            fontSize: 14,
            margin: [14, 0, 0, 8],
          },
        ],
      },
      !this.poliza || !this.cobertura
        ? {
            stack: [
              {
                text: 'Datos del seguro',
                alignment: 'center',
                fontSize: 16,
                margin: [14, 0, 0, 8],
              },
            ],
          }
        : '',
      !this.poliza
        ? {
            stack: [
              {
                text: `Póliza: ${
                  this.n_poliza ? this.n_poliza : 'Sin definir'
                }`,
                alignment: 'left',
                fontSize: 14,
                margin: [14, 0, 0, 8],
              },
            ],
          }
        : '',
      !this.cobertura
        ? {
            stack: [
              {
                text: `Cobertura: ${
                  this.tipo_cobertura ? this.tipo_cobertura : 'Sin definir'
                }`,
                alignment: 'left',
                fontSize: 14,
                margin: [14, 0, 0, 8],
              },
            ],
          }
        : '',
      {
        stack: [
          {
            text: 'Datos del vehículo',
            alignment: 'center',
            fontSize: 16,
            margin: [14, 0, 0, 8],
          },
        ],
      },
      {
        stack: [
          {
            text: `Bien asegurado: ${
              this.veh_asegurado ? this.veh_asegurado : 'No se proveyó'
            }`,
            alignment: 'left',
            fontSize: 14,
            margin: [14, 0, 0, 8],
          },
        ],
      },
      !this.anio
        ? {
            stack: [
              {
                text: `Año: ${this.text_anio ? this.text_anio : 'Sin definir'}`,
                alignment: 'left',
                fontSize: 14,
                margin: [14, 0, 0, 8],
              },
            ],
          }
        : '',
      !this.patente
        ? {
            stack: [
              {
                text: `Patente: ${
                  this.patente_asegurado
                    ? this.patente_asegurado
                    : 'Sin definir'
                }`,
                alignment: 'left',
                fontSize: 14,
                margin: [14, 0, 0, 8],
              },
            ],
          }
        : '',
      this.hasTerceros
        ? {
            stack: [
              {
                text: this.conductor
                  ? `Conductor: ${this.conductor}, DNI: ${
                      this.dni_conductor
                        ? this.dni_conductor
                        : 'Sin información'
                    }`
                  : '',
                alignment: 'left',
                fontSize: 14,
                margin: [14, 0, 0, 8],
              },
            ],
          }
        : '',
      this.hasTerceros ? this.tercerosPdf() : '',
      {
        stack: [
          {
            text: '',
            pageBreak: 'after',
          },
        ],
      },
      // Aca hay un salto de pagina
    ];
    return content;
  }

  tercerosPdf() {
    const stack: ContentStack[] = [];
    stack.push({
      stack: [
        {
          text: 'Datos de terceros',
          alignment: 'center',
          fontSize: 16,
          margin: [14, 0, 0, 8],
        },
      ],
    });
    this.tercerosComponents.forEach((t) => {
      stack.push({
        stack: [
          {
            text: `Nombre: ${t.nombre}, DNI: ${
              t.dni ? t.dni : 'Sin información'
            }, aseguradora: ${t.aseguradora}`,
            alignment: 'left',
            fontSize: 14,
            margin: [14, 0, 0, 8],
          },
        ],
      });
    });
    return stack;
  }

  async ampDenuncia() {
    const content: Content = [
      {
        stack: [
          {
            text: 'Ampliación de denuncia',
            alignment: 'center',
            fontSize: 16,
            margin: [0, 0, 0, 10],
          },
        ],
      },
      {
        stack: [
          {
            text: this.amp_denuncia
              ? this.amp_denuncia
              : 'No se cargó una ampliación de denuncia',
            alignment: 'left',
            fontSize: 13,
            margin: [14, 0, 0, 10],
            pageBreak: 'after',
          },
        ],
      },
    ];
    return content;
  }

  async imagesPage() {
    // Creamos la variable
    const content: Content = [];
    if (this.images.length === 0)
      //En caso que no existan imágenes
      content.push({
        stack: [
          {
            text: 'No se cargaron imágenes',
            alignment: 'center',
            margin: [0, 0, 0, 20],
            fontSize: 14,
          },
        ],
      });
    // Esta variable sirve para los saltos de página
    let i = 0;
    let ruedas = ['rdi', 'rdd', 'rti', 'rtd'];
    for (const [index, image] of this.images.entries()) {
      /**
       * Comparamos las dimensiones, si el alto es mayor que el ancho (con un 10% +),
       * significa que la imagen entra en una hoja solamente, caso contrario, serían 2
       */
      if (this.isRoboRueda) {
        if (!image.dot) {
          const compare = await compareDimensions(image.img);
          if (compare) {
            i = 0;
            /**
             * Ahora comparamos que no sea mayor que el alto de la hora
             *   ! fit: [495, 742],
             *   !El restante de una hoja A4, con los margin, es de 736 de alto, y 368 de ancho aprox,
             */
            const imgHeight: number = await getImageHeight(image.img);
            if (imgHeight > 710) {
              //* En esta sección, no manejamos el ancho, sino el alto
              const stack: ContentStack = {
                stack: [
                  {
                    text: image.comment,
                    alignment: 'center',
                    margin: [0, 0, 0, 10],
                    fontSize: 14,
                  }, // [left, top, right, bottom]
                  {
                    image: image.img,
                    fit: [495, 600],
                    //height: 600,
                    alignment: 'center',
                    margin: [0, 0, 0, 15],
                    pageBreak:
                      index !== this.images.length - 1 ? 'after' : undefined,
                  },
                ],
              };
              content.push(stack);
            } else {
              /**
               * En caso que no sea mayor que el ancho de la hoja, lo manejamos por el ancho
               */
              const stack: ContentStack = {
                stack: [
                  {
                    text: image.comment,
                    alignment: 'center',
                    margin: [0, 0, 0, 10],
                    fontSize: 14,
                  }, // [left, top, right, bottom]
                  {
                    image: image.img,
                    fit: [495, 700],
                    //width: 420, //width: 380,
                    alignment: 'center',
                    margin: [0, 0, 0, 15],
                    pageBreak:
                      index !== this.images.length - 1 ? 'after' : undefined,
                  },
                ],
              };
              content.push(stack);
            }
          } else {
            /**
             * Si no supera el ancho, significa que se pueden colocar 2 por hoja
             */
            //* Si el contador entra en 2, agregamos un salto de página
            //! TENER EN CUENTA QUE SI LA IMAGEN ES LA ÚLTIMA, NO DEBE SALTAR LA PÁG.
            i++;
            const stack: ContentStack = {
              stack: [
                {
                  text: image.comment,
                  alignment: 'center',
                  margin: [0, 0, 0, 10],
                  fontSize: 14,
                }, // [left, top, right, bottom]
                {
                  image: image.img,
                  //width: 368, //width: 280,
                  //fit: [380, 300],
                  fit: [480, 330],
                  alignment: 'center',
                  margin: [0, 0, 0, 15],
                  pageBreak:
                    index !== this.images.length - 1
                      ? i === 2
                        ? 'after'
                        : undefined
                      : undefined,
                },
              ],
            };
            content.push(stack);
            if (i === 2) i = 0;
          }
        } else if (ruedas.includes(image.dot.code)) {
          ruedas = ruedas.filter((r) => r !== image.dot?.code);
          const a = this.images.find((i) => i.dot?.code === image.dot?.code);
          const b = this.images.find(
            (i) => i.dot?.code === image.dot?.code + 'd'
          );
          const c = this.images.find(
            (i) => i.dot?.code === image.dot?.code + 'dot'
          );
          const stack: ContentStack = {
            stack: [
              {
                text: a?.dot?.name!,
                alignment: 'center',
                margin: [0, 0, 0, 10],
                fontSize: 14,
                pageBreak: i === 1 ? 'before' : undefined,
              },
              {
                image: a!.img,
                fit: [320, 220],
                alignment: 'center',
                margin: [0, 0, 0, 15],
              },
              {
                text: b?.dot?.name!,
                alignment: 'center',
                margin: [0, 0, 0, 10],
                fontSize: 14,
              },
              {
                image: b!.img,
                fit: [320, 220],
                alignment: 'center',
                margin: [0, 0, 0, 15],
                pageBreak:
                  index !== this.images.length - 1
                    ? i === 2
                      ? 'after'
                      : undefined
                    : undefined,
              },
              {
                text: c?.dot?.name!,
                alignment: 'center',
                margin: [0, 0, 0, 10],
                fontSize: 14,
              },
              {
                image: c!.img,
                fit: [300, 200],
                alignment: 'center',
                margin: [0, 0, 0, 15],
                pageBreak: 'after',
              },
            ],
          };
          content.push(stack);
          i = 0;
        }
      }
    }
    return content;
  }

  async lastPage() {
    const content: Content = [
      {
        stack: [
          {
            text: 'Según el relevamiento realizado podemos decir:',
            alignment: 'left',
            fontSize: 14,
            margin: [14, 0, 14, 10],
            pageBreak: 'before',
          },
        ],
      },
      {
        stack: [
          {
            text: this.relevamiento
              ? this.relevamiento
              : 'No se ha cargado un relevamiento.',
            alignment: 'left',
            fontSize: 13,
            margin: [14, 0, 14, 14],
          },
        ],
      },
      {
        stack: [
          {
            text: 'Conclusión',
            alignment: 'left',
            fontSize: 14,
            margin: [14, 0, 14, 10],
          },
        ],
      },
      {
        stack: [
          {
            text: this.conclusion
              ? this.conclusion
              : 'No se ha cargado una conclusión',
            alignment: 'left',
            fontSize: 13,
            margin: [14, 0, 14, 14],
          },
        ],
      },
    ];
    return content;
  }
  // --------------------------------------------------------------------------->

  // --------------------------------------------------------------------------->
  /**                    Eventos drop para la carga de imágenes                */
  isDragging = false;
  @HostListener('dragenter', ['$event'])
  onDragEnter(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  @HostListener('drop', ['$event'])
  async onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (!this.pericia) {
      this.dialog.alertMessage(
        'Error de carga',
        'Para agregar imágenes, primero debe seleccionar una pericia.',
        () => {},
        true
      );
    } else {
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const adjunto = await convertFileToBase64(files[i]);
          this.images.push({
            id: 0,
            img: adjunto,
            dot: undefined,
            comment: '',
            mimeType: 'image/jpeg',
            originalImg: adjunto,
            edited: false,
          });
        }
      }
    }
  }
  // --------------------------------------------------------------------------->
  @ViewChild('tercerosContainer', { read: ViewContainerRef })
  tercerosContainer!: ViewContainerRef;
  tercerosComponents: TercerosComponent[] = [];

  generateComponent() {
    const component = this.tercerosContainer.createComponent(TercerosComponent);
    component.instance.delete.subscribe(() => {
      component.destroy();
      this.tercerosComponents = this.tercerosComponents.filter(
        (i) => i !== component.instance
      );
    });
    this.tercerosComponents.push(component.instance);
  }

  initComponent(terceros?: TerceroI[]) {
    terceros?.forEach((t) => {
      const component =
        this.tercerosContainer.createComponent(TercerosComponent);
      component.instance.id = t.id!;
      component.instance.nombre = t.nombre;
      component.instance.dni = t.dni;
      component.instance.aseguradora = t.aseguradora;
      component.instance.delete.subscribe(() => {
        component.destroy();
        this.tercerosComponents = this.tercerosComponents.filter(
          (i) => i !== component.instance
        );
      });
      this.tercerosComponents.push(component.instance);
    });
  }

  /** @description Devuelve la lista de los terceros, en caso de corresponder */
  tercerosList() {
    if (this.hasTerceros) {
      const terceros: TerceroI[] = [];
      this.tercerosComponents.forEach((t) => {
        terceros.push({
          id: t.id,
          nombre: t.nombre,
          dni: t.dni,
          aseguradora: t.aseguradora,
        });
      });
      return terceros;
    } else {
      return [];
    }
  }

  dots = originalDots;

  setDots(code: string | undefined) {
    const dot = this.dots.find((d) => d.code === code);
    //this.dots = this.dots.filter((d) => d.code !== code);
    return dot;
  }

  selectDot(ev?: any, index?: number) {
    if (this.images[index!]) {
      this.images[index!].dot = ev.value;
    }
    this.dots = originalDots;
    this.dots = this.dots.filter(
      (d) => !this.images.some((i) => i.dot?.code === d.code)
    );
  }
}
