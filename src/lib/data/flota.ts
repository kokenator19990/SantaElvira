import type { Equipo } from "../domain/tipos";
import { calcularSemaforos } from "../domain/semaforo";

// Helper para crear equipos de forma concisa
function mkEquipo(
  id: string,
  modelo: string,
  tipoFlota: Equipo["tipoFlota"],
  anio: number,
  horasAcumuladas: number,
  dfm: number,
  tmef: number,
  tmpr: number,
  tiempoOperativo: number,
  reserva: number,
  operativo: number,
  reservaPct: number,
  detProg: number,
  detNoProg: number,
  perdida: number,
  paroTotal = false,
  motivoParo?: string
): Equipo {
  const kpis = { dfm, tmef, tmpr, tiempoOperativo, reserva };
  return {
    id,
    modelo,
    tipoFlota,
    anio,
    horasAcumuladas,
    paroTotal,
    motivoParo,
    kpis,
    semaforo: calcularSemaforos(kpis),
    asarco: {
      operativo,
      reserva: reservaPct,
      detencionProgramada: detProg,
      detencionNoProgramada: detNoProg,
      perdidaOperacional: perdida,
    },
    ultimaActualizacion: "2025-04-23T06:00:00Z",
  };
}

// ─── Flota CAT 785D (CH-01 … CH-08) — Estado: OK ─────────────────────────────
const flota785D: Equipo[] = [
  mkEquipo("CH-01","CAT 785D","785D",2018,28450, 88,82,4.2,83,6, 83,6,6,5,0),
  mkEquipo("CH-02","CAT 785D","785D",2018,29100, 87,79,4.5,82,7, 82,7,6,5,0),
  mkEquipo("CH-03","CAT 785D","785D",2019,26800, 89,85,3.8,84,5, 84,5,7,4,0),
  mkEquipo("CH-04","CAT 785D","785D",2019,27200, 86,78,4.9,81,8, 81,8,6,5,0),
  mkEquipo("CH-05","CAT 785D","785D",2020,24600, 87,80,4.4,82,6, 82,6,7,5,0),
  mkEquipo("CH-06","CAT 785D","785D",2020,25100, 88,83,4.1,83,6, 83,6,6,5,0),
  mkEquipo("CH-07","CAT 785D","785D",2021,22300, 90,88,3.5,85,5, 85,5,6,4,0),
  mkEquipo("CH-08","CAT 785D","785D",2021,21900, 86,76,5.1,81,7, 81,7,7,5,0),
];

// ─── Flota CAT 777F (CE-01…CE-12) — Estado: CRÍTICO + 2 PAROS ───────────────
const flota777F: Equipo[] = [
  // Paro total
  mkEquipo("CE-04","CAT 777F","777F",2016,38200, 0,0,0,0,0, 0,0,0,100,0, true,"Bomba hidráulica HPN-2847"),
  mkEquipo("CE-19","CAT 777F","777F",2016,37800, 0,0,0,0,0, 0,0,0,100,0, true,"Kit frenos RKB-445"),
  // Crítico
  mkEquipo("CE-01","CAT 777F","777F",2015,41200, 72,48,18,68,22, 68,22,4,6,0),
  mkEquipo("CE-02","CAT 777F","777F",2015,40800, 74,51,16,70,20, 70,20,4,6,0),
  mkEquipo("CE-03","CAT 777F","777F",2015,39600, 71,45,20,67,24, 67,24,3,6,0),
  mkEquipo("CE-05","CAT 777F","777F",2016,38900, 73,50,17,69,21, 69,21,4,6,0),
  mkEquipo("CE-06","CAT 777F","777F",2016,38100, 74,52,15,71,19, 71,19,5,5,0),
  mkEquipo("CE-07","CAT 777F","777F",2016,37500, 72,47,19,68,23, 68,23,4,5,0),
  mkEquipo("CE-08","CAT 777F","777F",2017,36200, 75,55,14,71,18, 71,18,5,6,0),
  mkEquipo("CE-09","CAT 777F","777F",2017,35900, 73,49,18,69,22, 69,22,4,5,0),
  mkEquipo("CE-10","CAT 777F","777F",2017,34600, 74,53,16,70,20, 70,20,5,5,0),
  mkEquipo("CE-11","CAT 777F","777F",2017,34100, 71,46,20,67,25, 67,25,3,5,0),
  mkEquipo("CE-12","CAT 777F","777F",2017,33800, 73,50,17,69,21, 69,21,4,6,0),
];

// ─── Flota CAT 992 Cargadora (CG-01 … CG-05) — Estado: CRÍTICO ───────────────
const flota992: Equipo[] = [
  mkEquipo("CG-01","CAT 992",  "992", 2014,52100, 65,42,22,62,28, 62,28,4,6,0),
  mkEquipo("CG-02","CAT 992",  "992", 2014,51800, 67,44,20,63,27, 63,27,4,6,0),
  mkEquipo("CG-03","CAT 992",  "992", 2014,50400, 64,40,24,61,30, 61,30,3,6,0),
  mkEquipo("CG-04","CAT 992",  "992", 2015,48900, 68,46,19,64,26, 64,26,4,6,0),
  mkEquipo("CG-05","CAT 992",  "992", 2015,47600, 66,43,21,63,27, 63,27,4,6,0),
];

// ─── Flota Komatsu PC-2000 Excavadora (EX-01, EX-02) — Estado: OK ─────────────
const flotaPC2000: Equipo[] = [
  mkEquipo("EX-01","Komatsu PC-2000","PC2000",2021,18600, 91,90,3.2,86,5, 86,5,6,3,0),
  mkEquipo("EX-02","Komatsu PC-2000","PC2000",2021,17900, 92,93,2.9,87,4, 87,4,6,3,0),
];

export const FLOTA: Equipo[] = [
  ...flota785D,
  ...flota777F,
  ...flota992,
  ...flotaPC2000,
];

export function getEquipoPorId(id: string): Equipo | undefined {
  return FLOTA.find((e) => e.id === id);
}

export function getFlotaPorTipo(tipo: Equipo["tipoFlota"]): Equipo[] {
  return FLOTA.filter((e) => e.tipoFlota === tipo);
}
