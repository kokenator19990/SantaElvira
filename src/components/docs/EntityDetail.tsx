"use client";

import { X } from "lucide-react";
import { clsx } from "clsx";

interface FieldDef {
  name: string;
  type: string;
  pk?: boolean;
  fk?: boolean;
  descripcion?: string;
  ejemplo?: string;
}

interface RelDef {
  target: string;
  tipo: string;
  label: string;
}

export interface EntityInfo {
  id: string;
  nombre: string;
  descripcion: string;
  headerBg: string;
  headerText: string;
  borderColor: string;
  campos: FieldDef[];
  relaciones: RelDef[];
}

interface EntityDetailProps {
  entity: EntityInfo | null;
  onClose: () => void;
}

export function EntityDetail({ entity, onClose }: EntityDetailProps) {
  if (!entity) return null;

  return (
    <div
      className={clsx(
        "absolute right-0 top-0 bottom-0 w-[340px] max-w-full z-20",
        "bg-white border-l border-[#E4E4E7] shadow-xl",
        "flex flex-col overflow-hidden",
        ""
      )}
      style={{ animation: "slideInRight 0.25s ease-out" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-3 shrink-0"
        style={{ backgroundColor: entity.headerBg }}
      >
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-bold leading-tight"
            style={{ color: entity.headerText }}
          >
            {entity.nombre}
          </h3>
          <p className="text-[11px] mt-0.5 opacity-80" style={{ color: entity.headerText }}>
            {entity.descripcion}
          </p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center hover:bg-black/10 transition-colors"
          aria-label="Cerrar detalle"
        >
          <X size={14} style={{ color: entity.headerText }} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Fields table */}
        <div className="px-4 py-3">
          <h4 className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-2">
            Campos
          </h4>
          <div className="border border-[#E4E4E7] rounded-lg overflow-hidden">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-[#F4F4F5]">
                  <th className="text-left px-2.5 py-1.5 font-semibold text-[#3F3F46]">
                    Campo
                  </th>
                  <th className="text-left px-2.5 py-1.5 font-semibold text-[#3F3F46]">
                    Tipo
                  </th>
                  <th className="text-center px-2 py-1.5 font-semibold text-[#3F3F46] w-10">
                    Clave
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F5]">
                {entity.campos.map((c) => (
                  <tr key={c.name} className="hover:bg-[#FAFAFA]">
                    <td className="px-2.5 py-1.5 font-medium text-[#09090B]">
                      {c.name}
                      {c.ejemplo && (
                        <span className="block text-[10px] text-[#A1A1AA] font-normal mt-0.5">
                          ej: {c.ejemplo}
                        </span>
                      )}
                    </td>
                    <td className="px-2.5 py-1.5 text-[#71717A] font-mono">
                      {c.type}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {c.pk && (
                        <span className="text-[8px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          PK
                        </span>
                      )}
                      {c.fk && (
                        <span className="text-[8px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          FK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Relationships */}
        {entity.relaciones.length > 0 && (
          <div className="px-4 py-3 border-t border-[#F4F4F5]">
            <h4 className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-2">
              Relaciones
            </h4>
            <div className="space-y-1.5">
              {entity.relaciones.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-[11px] px-2.5 py-1.5 bg-[#FAFAFA] rounded-md"
                >
                  <span className="text-[#B45309] font-mono font-bold shrink-0">
                    {r.tipo}
                  </span>
                  <span className="text-[#3F3F46]">{r.label}</span>
                  <span className="ml-auto text-[#71717A] font-medium shrink-0">
                    {r.target}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {entity.campos.some((c) => c.descripcion) && (
          <div className="px-4 py-3 border-t border-[#F4F4F5]">
            <h4 className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-2">
              Notas
            </h4>
            <div className="space-y-1">
              {entity.campos
                .filter((c) => c.descripcion)
                .map((c) => (
                  <p key={c.name} className="text-[11px] text-[#3F3F46]">
                    <strong className="text-[#09090B]">{c.name}:</strong>{" "}
                    {c.descripcion}
                  </p>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
