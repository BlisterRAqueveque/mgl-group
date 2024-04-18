export interface FirstPage {
  poliza: boolean;
  cobertura: boolean;
  hasTerceros: boolean;
  anio: boolean;
  tipo_siniestro: string;
  hecho: string;
  n_siniestro: string;
  n_denuncia: string;
  nombre_asegurado: string;
  dir_asegurado: string;
  tel_asegurado: string;
  n_poliza: string;
  tipo_cobertura: string;
  veh_asegurado: string;
  text_anio: string;
  patente: boolean;
  patente_asegurado: string;
  conductor: string;
  dni_conductor: string;
  amp_denuncia: string;
  mail_asegurado: string;
}

export interface LastPage {
  relevamiento: string;
  conclusion: string;
  abierta: boolean;
}
