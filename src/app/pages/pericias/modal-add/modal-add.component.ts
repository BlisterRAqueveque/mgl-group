import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroPlusCircleSolid } from '@ng-icons/heroicons/solid';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { RenderDirective } from '../../../directives/render.directive';
import { AseguradoraI } from '../../../interfaces/aseguradora.interface';
import { PericiaI, TerceroI } from '../../../interfaces/pericia.interface';
import { TipoSiniestroI } from '../../../interfaces/tipo-siniestro.interface';
import { UsuarioI } from '../../../interfaces/user-token.interface';
import { AuthService } from '../../../services/auth/auth.service';
import { PericiaService } from '../../../services/pericias/pericias.service';
import { DialogComponent } from '../../../shared/dialog/dialog.component';
import { TercerosComponent } from './terceros/terceros.component';

@Component({
  selector: 'app-modal-add',
  standalone: true,
  imports: [
    DialogModule,
    CommonModule,
    FormsModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    InputMaskModule,
    RippleModule,
    DialogComponent,
    RenderDirective,
    NgIconComponent,
    TercerosComponent,
    CheckboxModule,
  ],
  providers: [
    provideIcons({
      heroPlusCircleSolid,
    }),
  ],
  templateUrl: './modal-add.component.html',
  styleUrl: './modal-add.component.css',
})
export class ModalAddComponent {
  constructor(
    private readonly periciaService: PericiaService,
    private readonly auth: AuthService
  ) {}

  /** @description Información del usuario */
  user!: UsuarioI;

  /** @description Variables contenedoras de las entidades traídas desde la base de datos. */
  aseguradoras!: AseguradoraI[];
  tipos!: TipoSiniestroI[];
  verificadores!: UsuarioI[];

  /** @description Variables que van a contener el resultado seleccionado de cada lista. */
  selectedAseguradora!: AseguradoraI | null;
  selectedTipo!: TipoSiniestroI | null;
  selectedVerificador!: UsuarioI | null;

  fecha_asignado!: any;
  n_siniestro!: number | undefined;
  n_denuncia!: number | undefined;
  nombre_asegurado!: string;
  dir_asegurado!: string;
  tel_asegurado!: string;
  mail_asegurado!: string;
  veh_asegurado!: string;
  patente_asegurado!: string;

  anio: number | undefined;
  hasAnio = false;

  poliza!: string;
  hasPoliza = false;

  cobertura!: string;
  hasCobertura = false;

  async ngOnInit() {
    this.user = (await this.auth.returnUserInfo()) as UsuarioI;
    this.periciaService.getFormFormat().subscribe({
      next: (data) => {
        this.aseguradoras = data.aseguradoras;
        this.tipos = data.tipos;
        data.verificadores.forEach((verificador) => {
          verificador.nombre = `${verificador.nombre} ${verificador.apellido}`;
        });
        this.verificadores = data.verificadores;
      },
      error: (e) => {
        console.log(e);
      },
    });
  }
  /** @description Set the visibility of the modal */
  visible = false;

  showModal(pericia?: PericiaI) {
    //* Podemos mandar la pericia como parámetro
    if (pericia) {
      this.pericia = pericia;
      this.fecha_asignado = new Date(pericia.fecha_asignado);
      this.selectedAseguradora = this.aseguradoras.find(
        (i) => i.id === pericia?.aseguradora?.id
      )!;
      this.selectedTipo = this.tipos.find(
        (i) => i.id === pericia?.tipo_siniestro?.id
      )!;
      this.showOthers();
      this.conductor = pericia.conductor!;
      this.dni_conductor = pericia.dni_conductor!;
      this.sameConductor = pericia.nombre_asegurado === pericia.conductor;
      this.selectedVerificador = this.verificadores.find(
        (i) => i.id === pericia?.verificador?.id
      )!;
      this.n_siniestro = pericia.n_siniestro!;
      this.n_denuncia = pericia.n_denuncia!;
      this.nombre_asegurado = pericia.nombre_asegurado;
      this.dir_asegurado = pericia.dir_asegurado;
      this.tel_asegurado = pericia.tel_asegurado;
      this.mail_asegurado = pericia.mail_asegurado;
      this.veh_asegurado = pericia.veh_asegurado;
      this.patente_asegurado = pericia.patente_asegurado;
      this.hasTerceros = pericia.terceros?.length! > 0;

      this.anio = pericia.anio;
      this.hasAnio = this.anio === undefined || this.anio === 0;

      this.poliza = pericia.poliza;
      this.hasPoliza = this.poliza === '' || this.poliza === null;

      this.cobertura = pericia.cobertura;
      this.hasCobertura = this.cobertura === null || this.cobertura === '';
      console.log(this.hasAnio, this.hasCobertura, this.hasPoliza);
      if (this.tercerosContainer) this.initComponent(pericia.terceros);
    }
    this.visible = true;
  }

  dismissModal() {
    this.error = false;
    this.visible = false;
    //* Reiniciamos el valor de las pericias.
    this.fecha_asignado = '';
    this.n_siniestro = undefined;
    this.n_denuncia = undefined;
    this.nombre_asegurado = '';
    this.dir_asegurado = '';
    this.tel_asegurado = '';
    this.mail_asegurado = '';
    this.veh_asegurado = '';
    this.patente_asegurado = '';
    this.selectedAseguradora = null;
    this.selectedTipo = null;
    this.selectedVerificador = null;
    this.tercerosComponents = [];
    if (this.tercerosContainer) this.tercerosContainer.clear();
    //* Reiniciamos el valor de la pericia en caso de ser cargado.
    this.pericia = undefined;
    this.hasTerceros = false;
    this.isVial = false;
    this.sameConductor = false;
    this.conductor = '';
    this.dni_conductor = '';

    this.anio = undefined;
    this.hasAnio = false;

    this.poliza = '';
    this.hasPoliza = false;

    this.cobertura = '';
    this.hasCobertura = false;
  }

  error = false;

  /** @description Al crearse la entidad, enviamos el resultado */
  @Output() emitNewPericia = new EventEmitter<PericiaI>();

  /** @description Instancia del componente dialog */
  @ViewChild('dialog') dialog!: DialogComponent;

  /** @description Muestra el dialogo para el insert */
  insertDialog() {
    const terceros: TerceroI[] = [];
    this.tercerosComponents.forEach((t) => {
      terceros.push({
        nombre: t.nombre,
        domicilio: t.domicilio,
        tel: t.tel,
        veh: t.veh,
        patente: t.patente,
        aseguradora: t.aseguradora,
        anio: t.anio,
        cobertura: t.cobertura,
        poliza: t.poliza,
      });
    });
    const newPericia: PericiaI = {
      fecha_asignado: this.fecha_asignado,
      n_siniestro: this.n_siniestro!,
      n_denuncia: this.n_denuncia!,
      nombre_asegurado: this.nombre_asegurado,
      dir_asegurado: this.dir_asegurado,
      tel_asegurado: this.tel_asegurado,
      mail_asegurado: this.mail_asegurado,
      veh_asegurado: this.veh_asegurado,
      patente_asegurado: this.patente_asegurado,
      conductor: this.isVial ? this.conductor : '',
      dni_conductor: this.isVial ? this.dni_conductor : '',
      aseguradora: this.selectedAseguradora!,
      tipo_siniestro: this.selectedTipo!,
      verificador: this.selectedVerificador!,
      terceros: this.isVial ? (this.hasTerceros ? terceros : []) : [],
      usuario_carga: this.user,
      anio: this.anio!,
      poliza: this.poliza,
      cobertura: this.cobertura,
    };
    if (this.validation(newPericia)) {
      this.dialog.confirm(
        'Carga de nueva pericia.',
        'Está a punto de dar de alta una nueva pericia, ¿Desea continuar?',
        () => {
          this.insert(newPericia);
        }
      );
    } else {
      this.error = true;
      this.dialog.alertMessage(
        'Error de carga',
        '¡Falta completar algunos campos!',
        () => {},
        true
      );
    }
  }

  /** @description Insertamos la nueva pericia */
  insert(newPericia: PericiaI) {
    this.dialog.loading = true;
    this.periciaService.insert(newPericia).subscribe({
      next: (data) => {
        this.dialog.alertMessage(
          'Confirmación de carga',
          'La pericia fue creada correctamente.',
          () => {
            //* Mandamos el nuevo usuario al componente suscrito
            this.emitNewPericia.emit(data);
            this.error = false;
            this.visible = false;
          }
        );
      },
      error: (e) => {
        switch (e.status) {
          default: {
            this.dialog.alertMessage(
              'Error de carga',
              'No se pudo crear la pericia, error interno.',
              () => {},
              true
            );
          }
        }
      },
    });
  }

  validation(pericia: PericiaI): boolean {
    // Verifica si alguna propiedad está vacía o es null/undefined
    /** pericia.n_siniestro && pericia.n_denuncia === undefined (estas no son obligatorias) */
    if (
      !pericia.fecha_asignado ||
      !pericia.nombre_asegurado ||
      !pericia.aseguradora ||
      !pericia.tipo_siniestro ||
      !pericia.verificador
    ) {
      return false; // Al menos una propiedad no está completa
    }
    return true; // Todas las propiedades están completadas
  }

  //----------------------------------------------------------------------------------->
  /**                              Sección readonly                                   */
  pericia!: PericiaI | undefined;

  //TODO Cuando se cargue el edit, poner la variable date
  updateDialog() {
    const terceros: TerceroI[] = [];
    this.tercerosComponents.forEach((t) => {
      terceros.push({
        id: t.id,
        nombre: t.nombre,
        aseguradora: t.aseguradora,
        domicilio: t.domicilio,
        tel: t.tel,
        veh: t.veh,
        patente: t.patente,
        anio: t.anio,
        poliza: t.poliza,
        cobertura: t.cobertura,
      });
    });
    const pericia: PericiaI = {
      fecha_asignado: this.fecha_asignado,
      aseguradora: this.selectedAseguradora!,
      n_siniestro: this.n_siniestro!,
      n_denuncia: this.n_denuncia!,
      nombre_asegurado: this.nombre_asegurado,
      dir_asegurado: this.dir_asegurado,
      tel_asegurado: this.tel_asegurado,
      mail_asegurado: this.mail_asegurado,
      tipo_siniestro: this.selectedTipo!,
      veh_asegurado: this.veh_asegurado,
      patente_asegurado: this.patente_asegurado,
      verificador: this.selectedVerificador!,
      conductor: this.isVial ? this.conductor : '',
      dni_conductor: this.isVial ? this.dni_conductor : '',
      terceros: this.isVial ? (this.hasTerceros ? terceros : []) : [],
      anio: this.anio!,
      poliza: this.poliza,
      cobertura: this.cobertura,
    };
    if (this.validation(pericia)) {
      this.dialog.confirm(
        'Edición de pericia.',
        'Está a punto de editar la información de la pericia. ¿Desea continuar?',
        () => {
          this.update(pericia);
        }
      );
    } else {
      this.error = true;
      this.dialog.alertMessage(
        'Error de carga',
        '¡Falta completar algunos campos!',
        () => {},
        true
      );
    }
  }

  @Output() emitUpdatePericia = new EventEmitter<PericiaI>();
  update(pericia: PericiaI) {
    console.log(pericia);
    this.dialog.loading = true;
    this.periciaService.update(this.pericia?.id!, pericia).subscribe({
      next: (data) => {
        this.dialog.alertMessage(
          'Confirmación de carga',
          'La pericia fue editada correctamente.',
          () => {
            //* Mandamos la entidad al componente suscrito
            this.emitUpdatePericia.emit(data);
            this.error = false;
            this.visible = false;
            //* Reiniciamos el valor
            this.pericia = undefined;
          }
        );
      },
      error: (e) => {
        console.log(e);
        this.dialog.alertMessage(
          'Error de carga',
          'No se pudo editar la pericia, hubo un error de servidor.',
          () => {},
          true
        );
      },
    });
  }

  changeState(pericia: PericiaI) {
    this.dialog.loading = true;
    this.dialog.confirm(
      'Edición de pericia.',
      `¿Esta seguro de ${
        pericia.activo ? 'desactivar' : 'activar'
      } la siguiente pericia del asegurado: ${pericia.nombre_asegurado}?`,
      () => {
        pericia.activo = !pericia.activo;
        this.periciaService.update(pericia?.id!, pericia).subscribe({
          next: (data) => {
            this.dialog.alertMessage(
              'Confirmación de carga',
              'La pericia fue editada correctamente.',
              () => {}
            );
          },
          error: (e) => {
            console.log(e);
            this.dialog.alertMessage(
              'Error de carga',
              'No se pudo editar la pericia, hubo un error de servidor.',
              () => {},
              true
            );
          },
        });
      }
    );
  }
  //----------------------------------------------------------------------------------->
  /** @description Muestra los terceros */
  hasTerceros = false;
  sameConductor = false;
  isVial = false;

  conductor = '';
  dni_conductor = '';
  showOthers() {
    if (
      this.selectedTipo
        ? this.selectedTipo.nombre.toLowerCase().includes('vial')
        : false
    ) {
      this.isVial = true;
    } else {
      this.isVial = false;
      this.sameConductor = false;
      this.dni_conductor = '';
      this.conductor = '';
    }
  }

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
      component.instance.dni = '';
      component.instance.domicilio = t.domicilio;
      component.instance.tel = t.tel;
      component.instance.veh = t.veh;
      component.instance.patente = t.patente;
      component.instance.aseguradora = t.aseguradora;
      component.instance.anio = t.anio;
      component.instance.poliza = t.poliza;
      component.instance.cobertura = t.cobertura;
      component.instance.delete.subscribe(() => {
        component.destroy();
        this.tercerosComponents = this.tercerosComponents.filter(
          (i) => i !== component.instance
        );
      });
      this.tercerosComponents.push(component.instance);
    });
  }

  setConductor() {
    if (this.sameConductor) {
      this.conductor = this.nombre_asegurado;
    }
  }
}
