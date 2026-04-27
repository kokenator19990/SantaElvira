"use client";

import { useState } from "react";
import type { ParametroApd } from "@/lib/domain/tipos";
import { parsearCsvApd } from "@/lib/domain/apd-parser";

type EstadoParseo = "idle" | "parsing" | "done" | "error";

export function useCsvApd() {
  const [estado, setEstado] = useState<EstadoParseo>("idle");
  const [datos, setDatos] = useState<ParametroApd[]>([]);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
  const [contenidoRaw, setContenidoRaw] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  function procesarArchivo(archivo: File) {
    setEstado("parsing");
    setNombreArchivo(archivo.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const contenido = e.target?.result as string;
        setContenidoRaw(contenido);
        const resultado = parsearCsvApd(contenido);
        if (resultado.length === 0) {
          setError("El archivo no contiene datos válidos o el encabezado no coincide con el formato esperado.");
          setEstado("error");
        } else {
          setDatos(resultado);
          setEstado("done");
        }
      } catch {
        setError("Error al procesar el archivo CSV.");
        setEstado("error");
      }
    };
    reader.onerror = () => {
      setError("No se pudo leer el archivo.");
      setEstado("error");
    };
    reader.readAsText(archivo);
  }

  function limpiar() {
    setEstado("idle");
    setDatos([]);
    setNombreArchivo(null);
    setContenidoRaw("");
    setError(null);
  }

  return { estado, datos, nombreArchivo, contenidoRaw, error, procesarArchivo, limpiar };
}
