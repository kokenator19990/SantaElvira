"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Error en Admin:", error);
    } else if (error.digest) {
      console.error("Error digest:", error.digest);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
      <div className="text-center">
        <h2 className="text-[18px] font-bold text-[#09090B] mb-1">
          Error en el panel de administración
        </h2>
        <p className="text-[13px] text-[#71717A] max-w-md">
          Ocurrió un problema al procesar la solicitud. Verifica tu conexión e
          intenta de nuevo.
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
