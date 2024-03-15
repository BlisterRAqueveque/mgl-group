import { AseguradoraI } from "./aseguradora.interface";
import { PericiaI } from "./pericia.interface";
import { TipoSiniestroI } from "./tipo-siniestro.interface";

export interface UserWithToken {
  token: string
  user: UsuarioI
}

export interface UsuarioI {
  id: number;
  nombre: string;
  apellido: string;
  contrasenia: string;
  username: string;
  email: string;
  superuser: boolean;
  rol: Roles;

  carga_pericia: PericiaI[];
  pericia: PericiaI[];

  tipo_siniestro: TipoSiniestroI[];

  aseguradora: AseguradoraI[];
}

export enum Roles {
  admin = 'admin',
  user = 'user',
  visit = 'visit',
}
