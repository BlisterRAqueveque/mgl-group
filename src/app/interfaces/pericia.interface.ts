import { AseguradoraI } from './aseguradora.interface';
import { InformeI } from './informe.interface';
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
  abierta?: boolean;
  activo?: boolean;

  fecha_creado?: Date;
  fecha_eliminado?: Date;

  usuario_carga?: UsuarioI;
  aseguradora?: AseguradoraI;

  tipo_siniestro?: TipoSiniestroI;
  verificador?: UsuarioI;

  informe?: InformeI;
}
