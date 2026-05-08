// ─── Tipos del dominio MSG — Mining Services Group ───────────────────────────

export type EstadoSemaforo = "verde" | "ambar" | "rojo" | "paro";

export type TipoFlota = "785D" | "777F" | "992" | "PC2000";

export interface KpiEquipo {
  dfm: number;           // Disponibilidad Física Mecánica (%)
  tmef: number;          // Tiempo Medio Entre Fallas (horas)
  tmpr: number;          // Tiempo Medio de Parada por Reparación (horas)
  tiempoOperativo: number; // % del turno en operación
  reserva: number;       // % del turno en reserva
}

export interface SemaforoEquipo {
  dfm: EstadoSemaforo;
  tmef: EstadoSemaforo;
  tmpr: EstadoSemaforo;
  tiempoOperativo: EstadoSemaforo;
  reserva: EstadoSemaforo;
  general: EstadoSemaforo;
}

export interface DistribucionAsarco {
  operativo: number;            // % horas
  reserva: number;              // % horas
  detencionProgramada: number;  // % horas
  detencionNoProgramada: number;// % horas
  perdidaOperacional: number;   // % horas
}

export interface Equipo {
  id: string;            // e.g. "CH-01", "CE-04", "CG-01"
  modelo: string;        // e.g. "CAT 785D"
  tipoFlota: TipoFlota;
  anio: number;
  horasAcumuladas: number;
  paroTotal: boolean;
  motivoParo?: string;   // e.g. "Bomba hidráulica HPN-2847"
  kpis: KpiEquipo;
  semaforo: SemaforoEquipo;
  asarco: DistribucionAsarco;
  ultimaActualizacion: string; // ISO date string
}

export interface FlotaResumen {
  tipo: TipoFlota;
  modelo: string;
  cantidad: number;
  enParo: number;
  dfmPromedio: number;
  tmefPromedio: number;
  tmprPromedio: number;
  tiempoOperativoPromedio: number;
  reservaPromedio: number;
  semaforoGeneral: EstadoSemaforo;
}

export interface Alerta {
  id: string;
  equipoId: string;
  modelo: string;
  tipoFlota: TipoFlota;
  kpi: keyof KpiEquipo | "apd";
  valorActual: number;
  umbralCritico: number;
  estado: EstadoSemaforo;
  mensaje: string;
  timestamp: string;
  accionTomada?: string;
  resueltaPor?: string;
  resueltaEn?: string;
}

export interface SerieTemporal {
  mes: string; // e.g. "Nov 24"
  dfm: number;
  tmef: number;
  tmpr: number;
  tiempoOperativo: number;
  reserva: number;
}

export interface SerieTemporalFlota {
  tipoFlota: TipoFlota;
  modelo: string;
  datos: SerieTemporal[];
}

export interface ParametroApd {
  equipo: string;
  compartimento: string;
  parametro: string;
  valor: number;
  unidad: string;
  limiteMinimo: number | null;
  limiteMaximo: number | null;
  estado: EstadoSemaforo;
}

export interface AsarcoFlota {
  tipoFlota: TipoFlota;
  modelo: string;
  distribucion: DistribucionAsarco;
}
