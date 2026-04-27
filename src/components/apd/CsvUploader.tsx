"use client";

import { useRef, useState } from "react";
import { Upload, FileText, X, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";

interface CsvUploaderProps {
  onArchivo: (archivo: File) => void;
  nombreArchivo: string | null;
  onLimpiar: () => void;
  estado: "idle" | "parsing" | "done" | "error";
}

export function CsvUploader({ onArchivo, nombreArchivo, onLimpiar, estado }: CsvUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);

  function manejarArchivo(archivo: File) {
    if (!archivo.name.endsWith(".csv") && !archivo.name.endsWith(".txt")) return;
    onArchivo(archivo);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setArrastrando(false);
    const f = e.dataTransfer.files[0];
    if (f) manejarArchivo(f);
  }

  if (estado === "done") {
    return (
      <div className="flex items-center gap-3 p-4 rounded-[10px] bg-[#F0FDF4] border border-[#BBF7D0]">
        <CheckCircle2 size={20} className="text-[#15803D] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-[#09090B] truncate">{nombreArchivo}</p>
          <p className="text-[12px] text-[#52525B] mt-0.5">Procesado correctamente</p>
        </div>
        <button
          onClick={onLimpiar}
          className="flex items-center justify-center w-8 h-8 rounded-[6px] text-[#A1A1AA] hover:text-[#52525B] hover:bg-[#F4F4F5] transition-colors"
          aria-label="Eliminar archivo"
        >
          <X size={15} />
        </button>
      </div>
    );
  }

  if (estado === "parsing") {
    return (
      <div className="flex items-center gap-3 p-4 rounded-[10px] bg-[#FFFBEB] border border-[#FDE68A]">
        <div className="w-5 h-5 border-2 border-[#B45309] border-t-transparent rounded-full animate-spin shrink-0" />
        <div>
          <p className="text-[15px] font-semibold text-[#09090B]">{nombreArchivo}</p>
          <p className="text-[12px] text-[#B45309]/70 mt-0.5">Procesando…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
      onDragLeave={() => setArrastrando(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), inputRef.current?.click())}
      aria-label="Zona de carga de archivo CSV"
      className={clsx(
        "flex flex-col items-center justify-center gap-3 p-8 rounded-[10px]",
        "border-2 border-dashed cursor-pointer transition-all duration-150",
        arrastrando
          ? "border-[#B45309] bg-[#FFFBEB]"
          : "border-[#E4E4E7] bg-white hover:border-[#D4D4D8] hover:bg-[#FAFAFA]"
      )}
    >
      <div className={clsx(
        "flex items-center justify-center w-12 h-12 rounded-[10px] transition-colors",
        arrastrando ? "bg-[#FFFBEB]" : "bg-[#F4F4F5]"
      )}>
        <Upload size={22} className={arrastrando ? "text-[#B45309]" : "text-[#A1A1AA]"} />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-semibold text-[#52525B]">
          {arrastrando ? "Suelta el archivo aquí" : "Arrastra tu CSV o haz clic"}
        </p>
        <p className="text-[12px] text-[#A1A1AA] mt-1 max-w-[200px] leading-relaxed">
          Formato: Equipo, Compartimento, Parámetro, Valor, Unidad, LimMin, LimMax
        </p>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-[#F4F4F5]">
        <FileText size={12} className="text-[#A1A1AA]" />
        <span className="text-[11px] text-[#71717A]">.csv · .txt</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.txt"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) manejarArchivo(f); }}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
