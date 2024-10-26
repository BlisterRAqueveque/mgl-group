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
import { AccordionModule } from 'primeng/accordion';
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
import { Images } from '../../interfaces/images.interface';
import { AdjuntoI, InformeI } from '../../interfaces/informe.interface';
import { FirstPage, LastPage } from '../../interfaces/pdf.interface';
import { PericiaI, TerceroI } from '../../interfaces/pericia.interface';
import { AuthService } from '../../services/auth/auth.service';
import { InformeService } from '../../services/informes/informe.service';
import { PericiaService } from '../../services/pericias/pericias.service';
import { ButtonComponent } from '../../shared/button/button.component';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { imgToBase64 } from '../../tools/img-to-url';
import { dataURLtoFile } from '../../tools/img-url-to-file';
import { AttachmentsComponent } from './components/attachments/attachments.component';
import { TercerosInformeComponent } from './components/terceros/terceros.component';
import { viewPdfTerceros } from './reports/informe-vial';
import { TablePericiasInformesComponent } from './table-pericias-informes/table-pericias-informes.component';
import { viewPdfRuedas } from './reports/informe-robo-rueda';
import { viewPdfBase } from './reports/informe-base';
import { Roles, UsuarioI } from '../../interfaces/user-token.interface';

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

  videoTutorial = false;
  videoUrl = `${environment.imagesUrl}Tutorial.mp4`;

  terminado = false;
  admin = false;
  user!: UsuarioI;

  async ngOnInit() {
    this.user = (await this.auth.returnUserInfo()) as UsuarioI;
    this.admin = this.user.rol === Roles.admin;
  }

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
          console.error(e);
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
    // this.pericia = null;
    // this.images = [];
    // this.hecho = '';
    // this.n_poliza = '';
    // this.tipo_cobertura = '';
    // this.amp_denuncia = '';
    // this.conclusion = '';
    // this.tipo_siniestro = '';
    // this.n_siniestro = '';
    // this.n_denuncia = '';
    // this.nombre_asegurado = '';
    // this.dir_asegurado = '';
    // this.tel_asegurado = '';
    // this.veh_asegurado = '';
    // this.patente_asegurado = '';
    // this.text_anio = '';
    // this.relevamiento = '';
    // this.conductor = '';
    // this.dni_conductor = '';
    // this.tercerosContainer.clear();
    // this.hasTerceros = false;
    // this.isRoboRueda = false;
    // this.documents = [];
    // this.car = [];
    // this.damages = [];
    // this.others = [];
    // this.rdi = [];
    // this.rdd = [];
    // this.rti = [];
    // this.rtd = [];
    // this.rda = [];
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

  email: string = '';

  /** @description Si la pericia está cerrada, muestra el cartel */
  close = false;

  hasTerceros = false;
  conductor = '';
  dni_conductor = '';

  isRoboRueda = false;

  async initModule(pericia: PericiaI) {
    this.dialog.loading = true;
    this.terminado = false;
    this.close = false;
    this.hasTerceros = pericia.tipo_siniestro
      ? pericia.tipo_siniestro.nombre!.includes('vial')!
      : false;
    this.isRoboRueda = pericia.tipo_siniestro
      ? pericia.tipo_siniestro.nombre!.includes('rueda')!
      : false;
    //* Si la pericia no tiene un informe asignado, debe crear uno nuevo
    if (!pericia.informe) {
      this.tipo_siniestro = pericia.tipo_siniestro
        ? pericia.tipo_siniestro?.nombre!
        : '';
      this.n_siniestro = pericia.n_siniestro
        ? pericia.n_siniestro?.toString()!
        : '';
      this.n_denuncia = pericia.n_denuncia
        ? pericia.n_denuncia?.toString()!
        : '';
      this.nombre_asegurado = pericia.nombre_asegurado;
      this.dir_asegurado = pericia.dir_asegurado;
      this.tel_asegurado = pericia.tel_asegurado;
      this.veh_asegurado = pericia.veh_asegurado;
      this.patente_asegurado = pericia.patente_asegurado;
      this.conductor = pericia.conductor!;
      this.dni_conductor = pericia.dni_conductor!;
      this.email = pericia.mail_asegurado;
      this.n_poliza = pericia.poliza;
      this.tipo_cobertura = pericia.cobertura;
      this.text_anio = pericia.anio ? pericia.anio.toString() : '';
      this.initComponent(pericia.terceros, !pericia.abierta);
    } else {
      //Si el informe no tiene ampliación de denuncia
      this.hasAmpDenuncia =
        pericia.informe.amp_denuncia !== undefined &&
        pericia.informe.amp_denuncia !== null &&
        pericia.informe.amp_denuncia !== '';

      this.tipo_siniestro = pericia.informe.tipo_siniestro;
      this.n_siniestro = pericia.informe.n_siniestro;
      this.n_denuncia = pericia.informe.n_denuncia;
      this.nombre_asegurado = pericia.informe.nombre_asegurado;
      this.dir_asegurado = pericia.informe.dir_asegurado;
      this.tel_asegurado = pericia.informe.tel_asegurado;
      this.veh_asegurado = pericia.informe.veh_asegurado;

      this.terminado = pericia.informe.terminado!;

      this.patente_asegurado = pericia.informe.patente_asegurado;
      this.patente =
        this.patente_asegurado === '' ||
        this.patente_asegurado === null ||
        this.patente_asegurado === undefined;

      this.hecho = pericia.informe.hecho;

      this.n_poliza = pericia.informe.n_poliza;
      this.poliza =
        this.n_poliza === '' ||
        this.n_poliza === null ||
        this.n_poliza === undefined;

      this.tipo_cobertura = pericia.informe.tipo_cobertura;
      this.cobertura =
        this.tipo_cobertura === '' ||
        this.tipo_cobertura === null ||
        this.tipo_cobertura === undefined;

      this.amp_denuncia = pericia.informe.amp_denuncia;
      this.conclusion = pericia.informe.conclusion;

      this.email = pericia.informe.mail_asegurado!;

      this.text_anio = pericia.informe.text_anio;
      this.anio =
        this.text_anio === '' ||
        this.text_anio === null ||
        this.text_anio === undefined;

      this.relevamiento = pericia.informe.relevamiento;

      this.conductor = pericia.informe.conductor!;
      this.dni_conductor = pericia.informe.dni_conductor!;

      const url = environment.imagesUrl;

      //! Se agregan los que no están en el informe, pero si se agregaron en la pericia
      const faltan = pericia.terceros?.filter((i) => {
        return !pericia.informe?.terceros?.some((item) => item.id === i.id);
      });
      if (faltan)
        pericia.informe.terceros = [...pericia.informe?.terceros!, ...faltan];
      this.initComponent(pericia.informe.terceros, !pericia.abierta);
      if (pericia.informe.adjuntos)
        pericia.informe.adjuntos.sort((a, b) => a.index - b.index);
      for (const a of pericia.informe.adjuntos) {
        const img = await imgToBase64(url + a.adjunto);
        switch (a.type) {
          case 'documents': {
            if (a.descripcion === 'Retiro de denuncia') this.retDenuncia = true;
            this.documents.push({
              id: a?.id!,
              img: img as string,
              dot: undefined,
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
              dot: undefined,
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
              dot: undefined,
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
              dot: undefined,
              comment: a.descripcion,
              type: a.type,
              mimeType: 'image/jpeg',
              originalImg: img as string,
              edited: false,
            });
            break;
          }
          case 'rdi': {
            this.rdi.push({
              id: a?.id!,
              img: img as string,
              dot: undefined,
              comment: a.descripcion,
              type: a.type,
              mimeType: 'image/jpeg',
              originalImg: img as string,
              edited: false,
            });
            break;
          }
          case 'rdd': {
            this.rdd.push({
              id: a?.id!,
              img: img as string,
              dot: undefined,
              comment: a.descripcion,
              type: a.type,
              mimeType: 'image/jpeg',
              originalImg: img as string,
              edited: false,
            });
            break;
          }
          case 'rti': {
            this.rti.push({
              id: a?.id!,
              img: img as string,
              dot: undefined,
              comment: a.descripcion,
              type: a.type,
              mimeType: 'image/jpeg',
              originalImg: img as string,
              edited: false,
            });
            break;
          }
          case 'rtd': {
            this.rtd.push({
              id: a?.id!,
              img: img as string,
              dot: undefined,
              comment: a.descripcion,
              type: a.type,
              mimeType: 'image/jpeg',
              originalImg: img as string,
              edited: false,
            });
            break;
          }
          case 'rda': {
            this.rda.push({
              id: a?.id!,
              img: img as string,
              dot: undefined,
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
  rdi: Images[] = [];
  rdd: Images[] = [];
  rti: Images[] = [];
  rtd: Images[] = [];
  rda: Images[] = [];

  /** @description Seteamos los valores de la lista */
  setList(img_list: Images[], type: string) {
    switch (type) {
      case 'documents': {
        if (img_list.length > 0 && this.hasAmpDenuncia) {
          img_list.forEach((d, i) => {
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
          });
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
      case 'rdi': {
        if (img_list.length > 0) {
          img_list.forEach((d, i) => {
            switch (i) {
              case 0: {
                d.comment = 'Rueda delantera izquierda';
                break;
              }
              case 1: {
                d.comment = 'Desgaste';
                break;
              }
              case 2: {
                d.comment = 'DOT';
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
      case 'rdd': {
        if (img_list.length > 0) {
          img_list.forEach((d, i) => {
            switch (i) {
              case 0: {
                d.comment = 'Rueda delantera derecha';
                break;
              }
              case 1: {
                d.comment = 'Desgaste';
                break;
              }
              case 2: {
                d.comment = 'DOT';
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
      case 'rti': {
        if (img_list.length > 0) {
          img_list.forEach((d, i) => {
            switch (i) {
              case 0: {
                d.comment = 'Rueda trasera izquierda';
                break;
              }
              case 1: {
                d.comment = 'Desgaste';
                break;
              }
              case 2: {
                d.comment = 'DOT';
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
      case 'rtd': {
        if (img_list.length > 0) {
          img_list.forEach((d, i) => {
            switch (i) {
              case 0: {
                d.comment = 'Rueda trasera derecha';
                break;
              }
              case 1: {
                d.comment = 'Desgaste';
                break;
              }
              case 2: {
                d.comment = 'DOT';
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
      case 'rda': {
        if (img_list.length > 0) {
          img_list.forEach((d, i) => {
            switch (i) {
              case 0: {
                d.comment = 'Rueda de auxilio';
                break;
              }
              case 1: {
                d.comment = 'Desgaste';
                break;
              }
              case 2: {
                d.comment = 'DOT';
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
  verInforme = false; //TODO PONER TRUE

  /** @description Muestra el dialogo de confirmación de carga */
  onUploadInforme() {
    if (this.verInforme) {
      this.dialog.confirm(
        'Pre visualización del informe',
        'Se abrirá una nueva pestaña con la visual del informe. Luego de verificado todo, lo podrá cargar.',
        () => {
          this.verInforme = false;
          this.viewPdf();
        }
      );
    } else {
      if (this.pericia) {
        this.dialog.confirm(
          'Confirmación de carga',
          `¿Está seguro/a de cargar en FORMA PARCIAL el informe creado? El mismo se le asignará a la pericia seleccionada.
          Recuerde que una vez terminado el mismo, deberá enviarlo para su revisión.`,
          () => {
            this.uploadInforme();
            this.verInforme = false;
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
    this.rdi.forEach((img, index) => {
      formData.append('files', dataURLtoFile(img.img, 'newFile', img.mimeType));
      adjuntos.push({
        adjunto: '',
        dot: img.dot?.code,
        descripcion: img.comment,
        type: img.type,
        index,
      });
    });
    this.rdd.forEach((img, index) => {
      formData.append('files', dataURLtoFile(img.img, 'newFile', img.mimeType));
      adjuntos.push({
        adjunto: '',
        dot: img.dot?.code,
        descripcion: img.comment,
        type: img.type,
        index,
      });
    });
    this.rti.forEach((img, index) => {
      formData.append('files', dataURLtoFile(img.img, 'newFile', img.mimeType));
      adjuntos.push({
        adjunto: '',
        dot: img.dot?.code,
        descripcion: img.comment,
        type: img.type,
        index,
      });
    });
    this.rtd.forEach((img, index) => {
      formData.append('files', dataURLtoFile(img.img, 'newFile', img.mimeType));
      adjuntos.push({
        adjunto: '',
        dot: img.dot?.code,
        descripcion: img.comment,
        type: img.type,
        index,
      });
    });
    this.rda.forEach((img, index) => {
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
      amp_denuncia: this.hasAmpDenuncia ? this.amp_denuncia : '',
      conclusion: this.conclusion,
      text_anio: this.text_anio,
      adjuntos: adjuntos,
      usuario_carga: user!,
      relevamiento: this.relevamiento,
      pericia: this.pericia!,
      terceros: this.tercerosList(formData),
      conductor: this.hasTerceros ? this.conductor : '',
      dni_conductor: this.hasTerceros ? this.dni_conductor : '',
      mail_asegurado: this.email,
    };
    formData.append('form', JSON.stringify(informe));
    this.informeService.insert(formData).subscribe({
      next: (data) => {
        this.table.getHistoric();
        this.pericia!.informe = data;
        this.dialog.alertMessage(
          'Confirmación de carga',
          'El informe se cargó con éxito. Recuerde que una vez terminado el mismo, deberá enviarlo para su revisión.',
          () => {
            this.setDefault();
          }
        );
      },
      error: (e) => {
        console.error(e);
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
    if (this.verInforme) {
      this.dialog.confirm(
        'Pre visualización del informe',
        'Se abrirá una nueva pestaña con la visual del informe. Luego de verificado todo, lo podrá cargar.',
        () => {
          this.verInforme = false;
          this.viewPdf();
        }
      );
    } else {
      this.dialog.confirm(
        'Confirmación de carga',
        `¿Está seguro/a de cargar en FORMA PARCIAL el informe creado? El mismo se le asignará a la pericia seleccionada.
          Recuerde que una vez terminado el mismo, deberá enviarlo para su revisión.`,
        async () => {
          await this.updateInforme();
          this.verInforme = false;
        }
      );
    }
  }
  async updateInforme(onlyUpload?: boolean, terminado?: boolean) {
    this.dialog.loading = true;
    this.terminado = terminado ? terminado : false;
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
    this.rdi.forEach((img, index) => {
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
    this.rdd.forEach((img, index) => {
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
    this.rti.forEach((img, index) => {
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
    this.rtd.forEach((img, index) => {
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
    this.rda.forEach((img, index) => {
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
      amp_denuncia: this.hasAmpDenuncia ? this.amp_denuncia : '',
      conclusion: this.conclusion,
      text_anio: this.text_anio,
      adjuntos: editedImages,
      usuario_carga: user!,
      relevamiento: this.relevamiento,
      pericia: this.pericia!,
      terceros: this.tercerosEditList(formData),
      conductor: this.hasTerceros ? this.conductor : '',
      dni_conductor: this.hasTerceros ? this.dni_conductor : '',
      mail_asegurado: this.email,
      terminado: terminado ? terminado : false,
      corregido: this.admin,
      fecha_terminado: terminado ? new Date() : null,
    };
    formData.append('form', JSON.stringify(informe));
    if (!onlyUpload) {
      this.informeService
        .update(this.pericia?.informe?.id!, formData)
        .subscribe({
          next: (data) => {
            this.table.getHistoric();
            this.dialog.alertMessage(
              'Confirmación de carga',
              'El informe se modificó con éxito. Recuerde que una vez terminado el mismo, deberá enviarlo para su revisión.',
              () => {
                this.setDefault();
              }
            );
          },
          error: (e) => {
            console.error(e);
            this.dialog.alertMessage(
              'Error de carga',
              'Ocurrió un error en la carga.',
              () => {},
              true
            );
          },
        });
    } else {
      try {
        const result = await firstValueFrom(
          this.informeService.update(this.pericia?.informe?.id!, formData)
        );
      } catch (error) {
        console.error(error);
        this.dialog.alertMessage(
          'Error de carga',
          'Ocurrió un error al intentar cerrar el informe.',
          () => {},
          true
        );
      }
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
      mail_asegurado: this.email,
      hasAmpDenuncia: this.hasAmpDenuncia,
    };
    const lastPage: LastPage = {
      relevamiento: this.relevamiento,
      conclusion: this.conclusion,
      abierta: this.pericia?.abierta!,
    };
    if (this.hasTerceros)
      await viewPdfTerceros(
        firstPage,
        lastPage,
        this.tercerosComponents,
        this.documents,
        this.car,
        this.damages,
        this.others,
        !this.pericia?.abierta!
      );
    else if (this.isRoboRueda)
      viewPdfRuedas(
        firstPage,
        lastPage,
        this.documents,
        this.car,
        this.others,
        this.rdi,
        this.rdd,
        this.rti,
        this.rtd,
        this.rda,
        !this.pericia?.abierta!
      );
    else {
      viewPdfBase(
        firstPage,
        lastPage,
        this.documents,
        this.car,
        this.others,
        !this.pericia?.abierta!
      );
    }
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
            if (a.descripcion === 'Retiro de denuncia')
              component.instance.retDenuncia = true;
            component.instance.documents.push({
              id: a?.id!,
              img: img as string,
              dot: undefined,
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
              dot: undefined,
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
      component.instance.amp_denuncia = t.amp_denuncia!;
      component.instance.patente = t.patente;
      component.instance.readonly = readonly!;
      component.instance.email = t.mail_tercero;
      component.instance.tercero = t;
      component.instance.anio = t.anio;
      component.instance.poliza = t.poliza;
      component.instance.cobertura = t.cobertura;
      component.instance.amp_denuncia = t.amp_denuncia!;
      component.instance.hasAmpDenuncia =
        t.amp_denuncia !== null &&
        t.amp_denuncia !== undefined &&
        t.amp_denuncia !== '';
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
          amp_denuncia: t.amp_denuncia,
          aseguradora: t.aseguradora,
          patente: t.patente,
          adjuntos: adjuntos,
          anio: t.anio,
          poliza: t.poliza,
          cobertura: t.cobertura,
          mail_tercero: t.email,
        });
      });
      return terceros;
    } else {
      return [];
    }
  }
  tercerosEditList(formData: FormData): TerceroI[] | undefined {
    //! 27/04/2024 () => Si existen terceros, se edita, sino, se carga uno nuevo!
    if (this.hasTerceros) {
      const terceros: TerceroI[] = [];
      this.tercerosComponents.forEach((t) => {
        const editedImages: AdjuntoI[] = [];
        if (t.tercero) {
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
            amp_denuncia: t.amp_denuncia,
            aseguradora: t.aseguradora,
            patente: t.patente,
            adjuntos: editedImages,
            anio: t.anio,
            poliza: t.poliza,
            cobertura: t.cobertura,
            mail_tercero: t.email,
          });
        } else {
          t.documents.forEach((img, index) => {
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
          });
          t.car.forEach((img, index) => {
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
          });
          terceros.push({
            id: t.id,
            nombre: t.nombre,
            domicilio: t.domicilio,
            tel: t.tel,
            veh: t.veh,
            amp_denuncia: t.amp_denuncia,
            aseguradora: t.aseguradora,
            patente: t.patente,
            adjuntos: editedImages,
            anio: t.anio,
            poliza: t.poliza,
            cobertura: t.cobertura,
            mail_tercero: t.email,
          });
        }
      });
      return terceros;
    } else {
      return [];
    }
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
      await this.updateInformeCerrar(true);
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
            console.error(e);
            this.dialog.alertMessage(
              'Error de carga',
              'Ocurrió un error al intentar cerrar el informe.',
              () => {},
              true
            );
          },
        });
    } catch (error) {
      console.error(error);
      this.dialog.alertMessage(
        'Error de carga',
        'Ocurrió un error al intentar cerrar el informe.',
        () => {},
        true
      );
    }
  }

  async updateInformeCerrar(onlyUpload?: boolean, terminado?: boolean) {
    this.dialog.loading = true;
    this.terminado = terminado ? terminado : false;
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
    this.rdi.forEach((img, index) => {
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
    this.rdd.forEach((img, index) => {
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
    this.rti.forEach((img, index) => {
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
    this.rtd.forEach((img, index) => {
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
    this.rda.forEach((img, index) => {
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
      amp_denuncia: this.hasAmpDenuncia ? this.amp_denuncia : '',
      conclusion: this.conclusion,
      text_anio: this.text_anio,
      adjuntos: editedImages,
      usuario_carga: user!,
      relevamiento: this.relevamiento,
      pericia: this.pericia!,
      terceros: this.tercerosEditList(formData),
      conductor: this.hasTerceros ? this.conductor : '',
      dni_conductor: this.hasTerceros ? this.dni_conductor : '',
      mail_asegurado: this.email,
      corregido: this.admin,
    };
    formData.append('form', JSON.stringify(informe));
    if (!onlyUpload) {
      this.informeService
        .update(this.pericia?.informe?.id!, formData)
        .subscribe({
          next: (data) => {
            this.table.getHistoric();
            this.dialog.alertMessage(
              'Confirmación de carga',
              'El informe se modificó con éxito. Recuerde que una vez terminado el mismo, deberá enviarlo para su revisión.',
              () => {
                this.setDefault();
              }
            );
          },
          error: (e) => {
            console.error(e);
            this.dialog.alertMessage(
              'Error de carga',
              'Ocurrió un error en la carga.',
              () => {},
              true
            );
          },
        });
    } else {
      try {
        const result = await firstValueFrom(
          this.informeService.update(this.pericia?.informe?.id!, formData)
        );
      } catch (error) {
        console.error(error);
        this.dialog.alertMessage(
          'Error de carga',
          'Ocurrió un error al intentar cerrar el informe.',
          () => {},
          true
        );
      }
    }
  }

  terminarInforme() {
    this.dialog.confirm(
      'Dar el informe por finalizado',
      'Esta a punto de dar el informe como finalizado para su revisión, ¿Desea continuar?',
      () => {
        this.updateInforme(false, true);
      }
    );
  }

  hasAmpDenuncia = true;
  retDenuncia = false;
  tipoAmpDenuncia = 'Ampliación de denuncia';
}
