import type { SerieTemporalFlota } from "../domain/tipos";

// Series temporales 6 meses — mostrando deterioro real en 777F y 992
export const TENDENCIAS: SerieTemporalFlota[] = [
  {
    tipoFlota: "785D",
    modelo: "CAT 785D",
    datos: [
      { mes: "Nov 24", dfm: 90, tmef: 88, tmpr: 3.8, tiempoOperativo: 86, reserva: 5 },
      { mes: "Dic 24", dfm: 89, tmef: 86, tmpr: 4.0, tiempoOperativo: 85, reserva: 6 },
      { mes: "Ene 25", dfm: 88, tmef: 84, tmpr: 4.1, tiempoOperativo: 84, reserva: 6 },
      { mes: "Feb 25", dfm: 88, tmef: 83, tmpr: 4.2, tiempoOperativo: 83, reserva: 6 },
      { mes: "Mar 25", dfm: 87, tmef: 81, tmpr: 4.4, tiempoOperativo: 82, reserva: 7 },
      { mes: "Abr 25", dfm: 87, tmef: 80, tmpr: 4.5, tiempoOperativo: 82, reserva: 7 },
    ],
  },
  {
    tipoFlota: "777F",
    modelo: "CAT 777F",
    datos: [
      { mes: "Nov 24", dfm: 82, tmef: 68, tmpr: 10,  tiempoOperativo: 78, reserva: 14 },
      { mes: "Dic 24", dfm: 80, tmef: 63, tmpr: 12,  tiempoOperativo: 76, reserva: 16 },
      { mes: "Ene 25", dfm: 78, tmef: 59, tmpr: 14,  tiempoOperativo: 74, reserva: 18 },
      { mes: "Feb 25", dfm: 76, tmef: 55, tmpr: 16,  tiempoOperativo: 72, reserva: 20 },
      { mes: "Mar 25", dfm: 74, tmef: 51, tmpr: 17,  tiempoOperativo: 70, reserva: 22 },
      { mes: "Abr 25", dfm: 73, tmef: 49, tmpr: 18,  tiempoOperativo: 69, reserva: 22 },
    ],
  },
  {
    tipoFlota: "992",
    modelo: "CAT 992",
    datos: [
      { mes: "Nov 24", dfm: 76, tmef: 58, tmpr: 14,  tiempoOperativo: 72, reserva: 20 },
      { mes: "Dic 24", dfm: 74, tmef: 54, tmpr: 16,  tiempoOperativo: 70, reserva: 22 },
      { mes: "Ene 25", dfm: 72, tmef: 50, tmpr: 18,  tiempoOperativo: 68, reserva: 24 },
      { mes: "Feb 25", dfm: 70, tmef: 47, tmpr: 20,  tiempoOperativo: 66, reserva: 26 },
      { mes: "Mar 25", dfm: 67, tmef: 44, tmpr: 21,  tiempoOperativo: 64, reserva: 27 },
      { mes: "Abr 25", dfm: 66, tmef: 43, tmpr: 22,  tiempoOperativo: 63, reserva: 28 },
    ],
  },
  {
    tipoFlota: "PC2000",
    modelo: "Komatsu PC-2000",
    datos: [
      { mes: "Nov 24", dfm: 93, tmef: 96, tmpr: 2.6, tiempoOperativo: 88, reserva: 4 },
      { mes: "Dic 24", dfm: 92, tmef: 94, tmpr: 2.8, tiempoOperativo: 87, reserva: 4 },
      { mes: "Ene 25", dfm: 92, tmef: 93, tmpr: 2.9, tiempoOperativo: 87, reserva: 5 },
      { mes: "Feb 25", dfm: 91, tmef: 92, tmpr: 3.0, tiempoOperativo: 86, reserva: 5 },
      { mes: "Mar 25", dfm: 91, tmef: 91, tmpr: 3.1, tiempoOperativo: 86, reserva: 5 },
      { mes: "Abr 25", dfm: 91, tmef: 91, tmpr: 3.0, tiempoOperativo: 87, reserva: 4 },
    ],
  },
];

export function getTendenciaPorTipo(tipo: SerieTemporalFlota["tipoFlota"]): SerieTemporalFlota | undefined {
  return TENDENCIAS.find((t) => t.tipoFlota === tipo);
}
