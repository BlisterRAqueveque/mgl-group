import { AseguradoraI } from './aseguradora.interface';
import { InformeI } from './informe.interface';
import { PericiaI } from './pericia.interface';
import { TipoSiniestroI } from './tipo-siniestro.interface';

export interface UserWithToken {
  token: string;
  user: UsuarioI;
}

export interface UsuarioI {
  id?: number;
  nombre: string;
  apellido: string;
  contrasenia?: string;
  username: string;
  email: string;
  tel: string;
  activo?: boolean;
  superuser?: boolean;
  rol: Roles;

  fecha_creado?: Date;
  fecha_eliminado?: Date;

  usuario_carga?: UsuarioI;
  usuarios_creados?: UsuarioI;
  carga_pericia?: PericiaI[];
  pericia?: PericiaI[];

  tipo_siniestro?: TipoSiniestroI[];

  aseguradora?: AseguradoraI[];

  informes?: InformeI[];

  nombre_completo?: string;
}

export enum Roles {
  admin = 'admin',
  user = 'user',
  visit = 'visit',
}
