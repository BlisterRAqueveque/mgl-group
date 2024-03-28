import { PericiaI } from './pericia.interface';
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
  conclusion: string;
  text_anio: string;
  adjuntos: AdjuntoI[];
  usuario_carga: UsuarioI;
  pericia: PericiaI;
  fecha_carga?: Date;
}

export interface AdjuntoI {
  id?: number;
  adjunto: string;
  descripcion: string;
  index: number;
}
