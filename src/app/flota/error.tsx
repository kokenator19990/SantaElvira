"use client";

import { useEffect } from "react";

export default function FlotaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error en Flota:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
      <div className="text-center">
        <h2 className="text-[18px] font-bold text-[#09090B] mb-1">
          Error al cargar la Flota
        </h2>
        <p className="text-[13px] text-[#71717A] max-w-md">
          No se pudieron obtener los datos de la flota. Intenta nuevamente.
        </p>
      </div>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-[8px] bg-[#09090B] text-white text-[13px] font-semibold hover:bg-[#27272A] transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}
