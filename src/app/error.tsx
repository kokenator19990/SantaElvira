"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Error no capturado:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh] px-4">
      <div className="flex flex-col items-center gap-2 max-w-md text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FEF2F2]">
          <span className="text-[20px]" aria-hidden="true">!</span>
        </div>
        <h1 className="text-[18px] font-bold text-[#09090B]">
          Error al cargar la página
        </h1>
        <p className="text-[13px] text-[#52525B] leading-relaxed">
          Ocurrió un problema inesperado. Puedes intentar recargar la página
          o volver al inicio.
        </p>
        {error.digest && (
          <p className="text-[11px] text-[#A1A1AA] font-mono">
            Ref: {error.digest}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-[7px] bg-[#09090B] hover:bg-[#27272A] text-white text-[13px] font-semibold transition-colors"
        >
          Reintentar
        </button>
        <a
          href="/portada"
          className="px-4 py-2 rounded-[7px] bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#52525B] text-[13px] font-medium transition-colors"
        >
          Ir al inicio
        </a>
      </div>
    </div>
  );
}
