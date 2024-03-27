export interface DashboardI {
  aseguradoras: {
    activos: number;
    inactivos: number;
  };
  pericias: {
    abiertas: number;
    cerradas: number;
  };
  tipoSiniestro: {
    activos: number;
    inactivos: number;
  };
  usuarios: {
    activos: number;
    inactivos: number;
  };
}
