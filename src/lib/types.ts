export interface ContractRecord {
  inst: string;
  ramo: string;
  tipoProc: string;
  tipoContrat: string;
  monto: number;
  proveedor: string;
  rfc: string;
  estrat: string;
  titulo: string;
  fechaFirma: string;
  excepcion: string;
  url: string;
  anio: number;
}

export interface DistributionItem {
  name: string;
  value: number;
  count: number;
}

export interface RankedItem {
  name: string;
  rfc?: string;
  monto: number;
  count: number;
}

export interface ParetoPoint {
  name: string;
  monto: number;
  acumulado: number;
}

export interface StackedInstitution {
  name: string;
  adjDirecta: number;
  licitacion: number;
  invitacion: number;
  entreEntes: number;
  otro: number;
}

export interface SummaryData {
  totalContratos: number;
  montoTotal: number;
  uniqueProveedores: number;
  uniqueInstituciones: number;
  pctAdjDirectaMonto: number;
  pctAdjDirectaCount: number;
  tipoProc: DistributionItem[];
  tipoContrat: DistributionItem[];
  estratificacion: DistributionItem[];
  topInstituciones: RankedItem[];
  topProveedoresMonto: RankedItem[];
  topProveedoresCount: RankedItem[];
  paretoData: ParetoPoint[];
  concentracion: { top10: number; top50: number; top100: number };
  adjVsLic: {
    adjDirectaMonto: number;
    adjDirectaCount: number;
    licitacionMonto: number;
    licitacionCount: number;
    invitacionMonto: number;
    invitacionCount: number;
    entreEntesMonto: number;
    entreEntesCount: number;
  };
  topInstitucionesStacked: StackedInstitution[];
  excepcionMotivos: DistributionItem[];
  topAdjDirectas: RankedItem[];
  instituciones: string[];
  outliers: OutlierRecord[];
  notes: string[];
  registrosExcluidos: number;
  tendencia?: TrendPoint[];
}

export interface TrendPoint {
  year: number;
  label: string;
  monto: number;
  contratos: number;
  proveedores: number;
}

export interface OutlierRecord {
  proveedor: string;
  rfc: string;
  inst: string;
  monto: number;
  titulo: string;
  estrat: string;
  tipo: "error_confirmado" | "revisar";
  nota: string;
}

export interface PaginatedResponse {
  data: ContractRecord[];
  total: number;
  page: number;
  pageSize: number;
}
