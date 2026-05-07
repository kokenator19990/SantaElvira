import { calcularSemaforoGeneral } from "@/lib/domain/semaforo";
import type { Equipo, FlotaResumen, TipoFlota } from "@/lib/domain/tipos";

export function calcularResumenFlota(
  tipo: TipoFlota,
  modelo: string,
  flota: Equipo[]
): FlotaResumen {
  const equipos = flota.filter((e) => e.tipoFlota === tipo);
  const activos = equipos.filter((e) => !e.paroTotal);
  const avg = (arr: number[]) => {
    if (arr.length === 0) return 0;
    const result = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10;
    return Number.isFinite(result) ? result : 0;
  };

  const dfm  = avg(activos.map((e) => e.kpis.dfm));
  const tmef = avg(activos.map((e) => e.kpis.tmef));
  const tmpr = avg(activos.map((e) => e.kpis.tmpr));

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
