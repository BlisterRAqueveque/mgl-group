import { CommonModule } from '@angular/common';
import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowDownOnSquareSolid,
  heroArrowsPointingOutSolid,
  heroDocumentCheckSolid,
  heroDocumentSolid,
  heroEyeSolid,
  heroMagnifyingGlassSolid,
  heroPlusCircleSolid,
} from '@ng-icons/heroicons/solid';
import * as pdfMake from 'pdfmake/build/pdfmake';
import {
  Content,
  ContentStack,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RippleModule } from 'primeng/ripple';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RenderDirective } from '../../directives/render.directive';
import {
  AdjuntoI,
  InformeI,
  originalDots,
} from '../../interfaces/informe.interface';
import { PericiaI, TerceroI } from '../../interfaces/pericia.interface';
import { AuthService } from '../../services/auth/auth.service';
import { InformeService } from '../../services/informes/informe.service';
import { PericiaService } from '../../services/pericias/pericias.service';
import { ButtonComponent } from '../../shared/button/button.component';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { compareDimensions, getImageHeight } from '../../tools/image-height';
import { imgToBase64 } from '../../tools/img-to-url';
import { dataURLtoFile } from '../../tools/img-url-to-file';
import { urlToBase64 } from '../../tools/tools';
import { TercerosComponent } from '../pericias/modal-add/terceros/terceros.component';
import { AttachmentsComponent } from './components/attachments/attachments.component';
import { TablePericiasInformesComponent } from './table-pericias-informes/table-pericias-informes.component';
import { TercerosInformeComponent } from './components/terceros/terceros.component';
import { Images } from '../../interfaces/images.interface';
import { AccordionModule } from 'primeng/accordion';
import { viewPdfTerceros } from './reports/informe-vial';
import { FirstPage, LastPage } from '../../interfaces/pdf.interface';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    TooltipModule,
    DialogModule,
    RippleModule,
    InputTextModule,
    InputTextareaModule,
    CheckboxModule,
    FormsModule,
    DialogComponent,
    ButtonComponent,
    TablePericiasInformesComponent,
    TercerosInformeComponent,
    DropdownModule,
    RenderDirective,
    TabViewModule,
    AttachmentsComponent,
    AccordionModule,
  ],
  templateUrl: './informes.component.html',
  styleUrl: './informes.component.css',
  providers: [
    provideIcons({
      heroEyeSolid,
      heroMagnifyingGlassSolid,
      heroDocumentSolid,
      heroArrowsPointingOutSolid,
      heroArrowDownOnSquareSolid,
      heroPlusCircleSolid,
      heroDocumentCheckSolid,
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
      this.initComponent(pericia.terceros, !pericia.abierta);
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
      this.initComponent(pericia.informe.terceros, !pericia.abierta);
      for (const a of pericia.informe.adjuntos) {
        const img = await imgToBase64(url + a.adjunto);
        switch (a.type) {
          case 'documents': {
            this.documents.push({
              id: a?.id!,
              img: img as string,
              dot: this.setDots(a.dot),
              comment: a.descripcion,
              type: a.type,
              mimeType: 'image/jpeg',
              originalImg: img as string,
              edited: false,
            });
            break;
          }
          case 'asegurado-auto': {
            this.car.push({
              id: a?.id!,
              img: img as string,
              dot: this.setDots(a.dot),
              comment: a.descripcion,
              type: a.type,
              mimeType: 'image/jpeg',
              originalImg: img as string,
              edited: false,
            });
            break;
          }
          case 'damages': {
            this.damages.push({
              id: a?.id!,
              img: img as string,
              dot: this.setDots(a.dot),
              comment: a.descripcion,
              type: a.type,
              mimeType: 'image/jpeg',
              originalImg: img as string,
              edited: false,
            });
            break;
          }
          case 'others': {
            this.others.push({
              id: a?.id!,
              img: img as string,
              dot: this.setDots(a.dot),
              comment: a.descripcion,
              type: a.type,
              mimeType: 'image/jpeg',
              originalImg: img as string,
              edited: false,
            });
            break;
          }
        }
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
  images: Images[] = [];
  documents: Images[] = [];
  car: Images[] = [];
  damages: Images[] = [];
  others: Images[] = [];

  /** @description Seteamos los valores de la lista */
  setList(img_list: Images[], type: string) {
    switch (type) {
      case 'documents': {
        if (img_list.length > 0) {
          img_list.forEach((d, i) => {
            switch (i) {
              case 0: {
                d.comment = 'Ampliación de denuncia';
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
          });
        }
        break;
      }
      case 'asegurado-auto': {
        if (img_list.length > 0) {
          img_list.forEach((d, i) => {
            switch (i) {
              case 0: {
                d.comment = 'Frente latera izquierdo';
                break;
              }
              case 1: {
                d.comment = 'Frente latera derecho';
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
    this.documents.forEach((img, index) => {
      formData.append('files', dataURLtoFile(img.img, 'newFile', img.mimeType));
      adjuntos.push({
        adjunto: '',
        dot: img.dot?.code,
        descripcion: img.comment,
        type: img.type,
        index,
      });
    });
    this.car.forEach((img, index) => {
      formData.append('files', dataURLtoFile(img.img, 'newFile', img.mimeType));
      adjuntos.push({
        adjunto: '',
        dot: img.dot?.code,
        descripcion: img.comment,
        type: img.type,
        index,
      });
    });
    this.damages.forEach((img, index) => {
      formData.append('files', dataURLtoFile(img.img, 'newFile', img.mimeType));
      adjuntos.push({
        adjunto: '',
        dot: img.dot?.code,
        descripcion: img.comment,
        type: img.type,
        index,
      });
    });
    this.others.forEach((img, index) => {
      formData.append('files', dataURLtoFile(img.img, 'newFile', img.mimeType));
      adjuntos.push({
        adjunto: '',
        dot: img.dot?.code,
        descripcion: img.comment,
        type: img.type,
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
      terceros: this.tercerosList(formData),
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
    this.documents.forEach((img, index) => {
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
          type: img.type,
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
          type: img.type,
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
    this.car.forEach((img, index) => {
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
          type: img.type,
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
          type: img.type,
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
    this.damages.forEach((img, index) => {
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
          type: img.type,
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
          type: img.type,
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
    this.others.forEach((img, index) => {
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
          type: img.type,
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
          type: img.type,
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
      terceros: this.tercerosEditList(formData),
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

  tercerosEditList(formData: FormData): TerceroI[] | undefined {
    if (this.hasTerceros) {
      const terceros: TerceroI[] = [];
      const editedImages: AdjuntoI[] = [];
      this.tercerosComponents.forEach((t) => {
        t.documents.forEach((img, index) => {
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
              type: img.type,
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
              type: img.type,
              index,
            });
          } else {
            //* Caso contrario, solo modificamos estas propiedades
            const ad = t.tercero.adjuntos!.find((i) => i.id === img.id);
            if (ad) {
              ad.index = index;
              ad.descripcion = img.comment;
              ad.dot = img.dot?.code;
              editedImages.push(ad);
            }
          }
        });
        t.car.forEach((img, index) => {
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
              type: img.type,
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
              type: img.type,
              index,
            });
          } else {
            //* Caso contrario, solo modificamos estas propiedades
            const ad = t.tercero?.adjuntos!.find((i) => i.id === img.id);
            if (ad) {
              ad.index = index;
              ad.descripcion = img.comment;
              ad.dot = img.dot?.code;
              editedImages.push(ad);
            }
          }
        });
        terceros.push({
          id: t.id,
          nombre: t.nombre,
          domicilio: t.domicilio,
          tel: t.tel,
          veh: t.veh,
          aseguradora: t.aseguradora,
          patente: t.patente,
          adjuntos: editedImages,
        });
      });
      return terceros;
    } else {
      return [];
    }
  }
  // --------------------------------------------------------------------------->
  /**                              Sección de PDF                              */

  async viewPdf() {
    const firstPage: FirstPage = {
      poliza: this.poliza,
      cobertura: this.cobertura,
      hasTerceros: this.hasTerceros,
      anio: this.anio,
      tipo_siniestro: this.tipo_siniestro,
      hecho: this.hecho,
      n_siniestro: this.n_siniestro,
      n_denuncia: this.n_denuncia,
      nombre_asegurado: this.nombre_asegurado,
      dir_asegurado: this.dir_asegurado,
      tel_asegurado: this.tel_asegurado,
      n_poliza: this.n_poliza,
      tipo_cobertura: this.tipo_cobertura,
      veh_asegurado: this.veh_asegurado,
      text_anio: this.text_anio,
      patente: this.patente,
      patente_asegurado: this.patente_asegurado,
      conductor: this.conductor,
      dni_conductor: this.dni_conductor,
      amp_denuncia: this.amp_denuncia,
    };
    const lastPage: LastPage = {
      relevamiento: this.relevamiento,
      conclusion: this.conclusion,
      abierta: this.pericia?.abierta!,
    };
    await viewPdfTerceros(
      firstPage,
      lastPage,
      this.tercerosComponents,
      this.documents,
      this.car,
      this.damages,
      this.others
    );
  }

  // --------------------------------------------------------------------------->

  @ViewChild('tercerosContainer', { read: ViewContainerRef })
  tercerosContainer!: ViewContainerRef;
  tercerosComponents: TercerosInformeComponent[] = [];

  generateComponent() {
    const component = this.tercerosContainer.createComponent(
      TercerosInformeComponent
    );
    component.instance.delete.subscribe(() => {
      component.destroy();
      this.tercerosComponents = this.tercerosComponents.filter(
        (i) => i !== component.instance
      );
    });
    this.tercerosComponents.push(component.instance);
  }

  initComponent(terceros?: TerceroI[], readonly?: boolean) {
    const url = environment.imagesUrl;
    terceros?.forEach(async (t) => {
      const component = this.tercerosContainer.createComponent(
        TercerosInformeComponent
      );
      t.adjuntos!.sort((a, b) => a.index - b.index);
      for (const a of t.adjuntos!) {
        const img = await imgToBase64(url + a.adjunto);
        switch (a.type) {
          case 'documents': {
            component.instance.documents.push({
              id: a?.id!,
              img: img as string,
              dot: this.setDots(a.dot),
              comment: a.descripcion,
              type: a.type,
              mimeType: 'image/jpeg',
              originalImg: img as string,
              edited: false,
            });
            break;
          }
          case 'asegurado-auto': {
            component.instance.car.push({
              id: a?.id!,
              img: img as string,
              dot: this.setDots(a.dot),
              comment: a.descripcion,
              type: a.type,
              mimeType: 'image/jpeg',
              originalImg: img as string,
              edited: false,
            });
            break;
          }
        }
      }
      component.instance.id = t.id!;
      component.instance.nombre = t.nombre;
      component.instance.domicilio = t.domicilio;
      component.instance.tel = t.tel;
      component.instance.veh = t.veh;
      component.instance.aseguradora = t.aseguradora;
      component.instance.patente = t.patente;
      component.instance.readonly = readonly!;
      component.instance.tercero = t;
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
  tercerosList(formData: FormData) {
    if (this.hasTerceros) {
      const terceros: TerceroI[] = [];
      const adjuntos: AdjuntoI[] = [];
      this.tercerosComponents.forEach((t) => {
        t.documents.forEach((img, index) => {
          formData.append(
            'files',
            dataURLtoFile(img.img, 'newFile', img.mimeType)
          );
          adjuntos.push({
            adjunto: '',
            dot: img.dot?.code,
            descripcion: img.comment,
            type: img.type,
            index,
          });
        });
        t.car.forEach((img, index) => {
          formData.append(
            'files',
            dataURLtoFile(img.img, 'newFile', img.mimeType)
          );
          adjuntos.push({
            adjunto: '',
            dot: img.dot?.code,
            descripcion: img.comment,
            type: img.type,
            index,
          });
        });
        terceros.push({
          id: t.id,
          nombre: t.nombre,
          domicilio: t.domicilio,
          tel: t.tel,
          veh: t.veh,
          aseguradora: t.aseguradora,
          patente: t.patente,
          adjuntos: adjuntos,
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

  closeInforme() {
    if (this.conclusion) {
      this.dialog.confirm(
        'Confirmación de carga',
        '¿Esta seguro de querer cerrar este informe? Para seguir editando, debe cambiar su estado a abierto.',
        () => {
          this.updatePericia();
        }
      );
    } else {
      this.dialog.alertMessage(
        'Error de carga',
        'Para cerrar el informe, se debe cargar una conclusión.',
        () => {},
        true
      );
    }
  }
  async updatePericia() {
    this.dialog.loading = true;
    try {
      await this.updateBeforeClose();
      this.periciaService
        .update(this.pericia?.id!, { abierta: false })
        .subscribe({
          next: (data) => {
            this.pericia = null;
            this.close = true;
            this.dialog.alertMessage(
              'Confirmación de carga',
              'El informe se cerro correctamente.',
              () => {}
            );
          },
          error: (e) => {
            console.log(e);
            this.dialog.alertMessage(
              'Error de carga',
              'Ocurrió un error al intentar cerrar el informe.',
              () => {},
              true
            );
          },
        });
    } catch (error) {
      console.log(error);
      this.dialog.alertMessage(
        'Error de carga',
        'Ocurrió un error al intentar cerrar el informe.',
        () => {},
        true
      );
    }
  }
  async updateBeforeClose() {
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
          type: img.type,
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
          type: img.type,
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
      relevamiento: this.relevamiento,
      pericia: this.pericia!,
      terceros: this.tercerosEditList(formData),
      conductor: this.hasTerceros ? this.conductor : '',
      dni_conductor: this.hasTerceros ? this.dni_conductor : '',
    };
    formData.append('form', JSON.stringify(informe));
    try {
      const result = await firstValueFrom(
        this.informeService.update(this.pericia?.informe?.id!, formData)
      );
      console.log(result);
    } catch (error) {
      console.log(error);
      this.dialog.alertMessage(
        'Error de carga',
        'Ocurrió un error al intentar cerrar el informe.',
        () => {},
        true
      );
    }
  }
}
