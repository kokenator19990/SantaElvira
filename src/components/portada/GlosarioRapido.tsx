"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const GLOSARIO = [
  {
    sigla: "DFM",
    nombre: "Disponibilidad Física Mecánica",
    definicion: "Porcentaje del turno en que el equipo está mecánicamente listo para trabajar.",
    ejemplo: "DFM 88% → De 100 horas, el equipo estuvo disponible 88h y solo 12h en reparación.",
    meta: "Meta: ≥ 85% (verde) · 75–85% (ámbar) · < 75% (rojo)",
  },
  {
    sigla: "TMEF",
    nombre: "Tiempo Medio Entre Fallas",
    definicion: "Promedio de horas que opera un equipo sin sufrir ninguna falla.",
    ejemplo: "TMEF 80h → El equipo falla en promedio cada 80 horas de operación.",
    meta: "Meta: ≥ 80h (verde) · 50–80h (ámbar) · < 50h (rojo)",
  },
  {
    sigla: "TMPR",
    nombre: "Tiempo Medio de Parada por Reparación",
    definicion: "Promedio de horas que dura cada reparación desde la falla hasta que el equipo vuelve a operar.",
    ejemplo: "TMPR 4h → En promedio, cada reparación tarda 4 horas.",
    meta: "Meta: ≤ 5h (verde) · 5–15h (ámbar) · > 15h (rojo)",
  },
  {
    sigla: "ASARCO",
    nombre: "Distribución ASARCO",
    definicion: "Método estándar minero que divide el tiempo del equipo en: Operativo, Reserva, Detención Programada, Detención No Programada y Pérdida Operacional.",
    ejemplo: "Un equipo con 83% Operativo, 6% Reserva y 6% Det. Programada tiene una distribución saludable.",
    meta: "Objetivo: maximizar Operativo y minimizar Detención No Programada.",
  },
  {
    sigla: "APD",
    nombre: "Análisis Predictivo de Aceites",
    definicion: "Análisis de laboratorio de muestras de aceite de los compartimentos del equipo para detectar desgaste antes de una falla.",
    ejemplo: "Nivel de hierro > 120 ppm en el motor indica desgaste acelerado → inspeccionar antes de la próxima guardia.",
    meta: "Cada parámetro tiene límites mínimo y máximo definidos por el fabricante.",
  },
] as const;

export function GlosarioRapido() {
  const [abierto, setAbierto] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-[#E4E4E7] bg-white divide-y divide-[#F4F4F5]">
      {GLOSARIO.map(({ sigla, nombre, definicion, ejemplo, meta }) => {
        const isOpen = abierto === sigla;
        return (
          <div key={sigla}>
            <button
              onClick={() => setAbierto(isOpen ? null : sigla)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#FAFAFA] transition-colors"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-[#B45309] bg-[#FFFBEB] px-2 py-0.5 rounded font-mono tracking-wider">
                  {sigla}
                </span>
                <span className="text-[13px] font-medium text-[#09090B]">{nombre}</span>
              </div>
              <ChevronDown
                size={15}
                className={`text-[#A1A1AA] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-1 space-y-2 bg-[#FAFAFA]">
                <p className="text-[13px] text-[#3F3F46] leading-relaxed">{definicion}</p>
                <div className="flex items-start gap-2 rounded-lg bg-[#F4F4F5] px-3 py-2">
                  <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider mt-0.5 shrink-0">Ej.</span>
                  <p className="text-[12px] text-[#52525B] leading-relaxed">{ejemplo}</p>
                </div>
                <p className="text-[11px] text-[#71717A]">{meta}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
