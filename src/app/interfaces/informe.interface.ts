import { PericiaI, TerceroI } from './pericia.interface';
import { UsuarioI } from './user-token.interface';

export interface InformeI {
  id?: number;
  tipo_siniestro: string;
  n_siniestro: string;
  n_denuncia: string;
  nombre_asegurado: string;
  dir_asegurado: string;
  tel_asegurado: string;
  veh_asegurado: string;
  patente_asegurado: string;
  hecho: string;
  n_poliza: string;
  tipo_cobertura: string;
  amp_denuncia: string;
  relevamiento: string;
  conclusion: string;
  text_anio: string;
  adjuntos: AdjuntoI[];
  usuario_carga?: UsuarioI;
  pericia: PericiaI;
  fecha_carga?: Date;
  terceros?: TerceroI[];
  conductor?: string;
  dni_conductor?: string;
}

export interface AdjuntoI {
  id?: number;
  adjunto: string;
  dot: string | undefined;
  descripcion: string;
  type: string;
  index: number;
}

export const originalDots = [
  { name: 'Rueda delantera izq.', code: 'rdi' },
  { name: 'Rueda delantera izq. desgaste', code: 'rdid' },
  { name: 'Rueda delantera izq. DOT', code: 'rdidot' },
  { name: 'Rueda delantera der.', code: 'rdd' },
  { name: 'Rueda delantera der. desgaste', code: 'rddd' },
  { name: 'Rueda delantera der. DOT', code: 'rdddot' },
  { name: 'Rueda trasera izq.', code: 'rti' },
  { name: 'Rueda trasera izq. desgaste', code: 'rtid' },
  { name: 'Rueda trasera izq. DOT', code: 'rtidot' },
  { name: 'Rueda trasera der.', code: 'rtd' },
  { name: 'Rueda trasera der. desgaste', code: 'rtdd' },
  { name: 'Rueda trasera der. DOT', code: 'rtddot' },
];
