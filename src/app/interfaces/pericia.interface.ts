import { AseguradoraI } from './aseguradora.interface';
import { AdjuntoI, InformeI } from './informe.interface';
import { TipoSiniestroI } from './tipo-siniestro.interface';
import { UsuarioI } from './user-token.interface';

export interface PericiaI {
  id?: number;
  fecha_asignado: any | null;
  n_siniestro: number | null;
  n_denuncia: number | null;
  nombre_asegurado: string;
  dir_asegurado: string;
  tel_asegurado: string;
  mail_asegurado: string;
  veh_asegurado: string;
  patente_asegurado: string;
  conductor?: string;
  dni_conductor?: string;
  abierta?: boolean;
  activo?: boolean;
  anio: number;
  poliza: string;
  cobertura: string;

  fecha_creado?: Date;
  fecha_eliminado?: Date;

  usuario_carga?: UsuarioI;
  aseguradora?: AseguradoraI;

  tipo_siniestro?: TipoSiniestroI;
  verificador?: UsuarioI;

  informe?: InformeI;

  terceros?: TerceroI[];
}

export interface TerceroI {
  id?: number;
  nombre: string;
  domicilio: string;
  tel: string;
  veh: string;
  patente: string;
  amp_denuncia?: string;
  aseguradora: string;
  mail_tercero: string

  anio: number;
  poliza: string;
  cobertura: string;

  pericia?: PericiaI;
  informe?: TerceroI;
  adjuntos?: AdjuntoI[];
}
