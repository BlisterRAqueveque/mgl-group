import { PericiaI } from "./pericia.interface";
import { UsuarioI } from "./user-token.interface";

export interface TipoSiniestroI {
  id?: number;
  nombre: string;
  activo?: boolean;
  fecha_creado?: Date;
  fecha_eliminado?: Date;

  usuario_carga?: UsuarioI;
  pericia?: PericiaI[];
}
