import { FLOTA } from "@/lib/data/flota";
import { calcularSemaforoGeneral } from "@/lib/domain/semaforo";
import type { Equipo, FlotaResumen, TipoFlota } from "@/lib/domain/tipos";

export function calcularResumenFlota(
  tipo: TipoFlota,
  modelo: string,
  flota: Equipo[] = FLOTA
): FlotaResumen {
  const equipos = flota.filter((e) => e.tipoFlota === tipo);
  const activos = equipos.filter((e) => !e.paroTotal);
  const avg = (arr: number[]) =>
    arr.length === 0 ? 0 : Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

  const dfm  = avg(activos.map((e) => e.kpis.dfm));
  const tmef = avg(activos.map((e) => e.kpis.tmef));
  const tmpr = Math.round((activos.reduce((a, e) => a + e.kpis.tmpr, 0) / (activos.length || 1)) * 10) / 10;

  return {
    tipo, modelo,
    cantidad:        equipos.length,
    enParo:          equipos.filter((e) => e.paroTotal).length,
    dfmPromedio:     dfm,
    tmefPromedio:    tmef,
    tmprPromedio:    tmpr,
    semaforoGeneral: calcularSemaforoGeneral({
      dfm, tmef, tmpr,
      tiempoOperativo: avg(activos.map((e) => e.kpis.tiempoOperativo)),
      reserva:         avg(activos.map((e) => e.kpis.reserva)),
    }),
  };
}
