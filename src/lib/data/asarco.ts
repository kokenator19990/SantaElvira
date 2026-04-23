import type { AsarcoFlota } from "../domain/tipos";

export const ASARCO_FLOTA: AsarcoFlota[] = [
  {
    tipoFlota: "785D",
    modelo: "CAT 785D",
    distribucion: {
      operativo:             82,
      reserva:               6,
      detencionProgramada:   6,
      detencionNoProgramada: 5,
      perdidaOperacional:    1,
    },
  },
  {
    tipoFlota: "777F",
    modelo: "CAT 777F",
    distribucion: {
      operativo:             69,
      reserva:               21,
      detencionProgramada:   4,
      detencionNoProgramada: 6,
      perdidaOperacional:    0,
    },
  },
  {
    tipoFlota: "992",
    modelo: "CAT 992",
    distribucion: {
      operativo:             63,
      reserva:               27,
      detencionProgramada:   4,
      detencionNoProgramada: 6,
      perdidaOperacional:    0,
    },
  },
  {
    tipoFlota: "PC2000",
    modelo: "PC-2000",
    distribucion: {
      operativo:             86,
      reserva:               5,
      detencionProgramada:   6,
      detencionNoProgramada: 3,
      perdidaOperacional:    0,
    },
  },
];
