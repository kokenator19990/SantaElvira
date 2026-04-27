"use client";

import { clsx } from "clsx";
import { SkeletonCard } from "./SkeletonCard";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";

export interface ColumnaDef<T> {
  key: string;
  header: string;
  helpKey?: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columnas: ColumnaDef<T>[];
  datos: T[];
  keyExtractor: (row: T) => string;
  cargando?: boolean;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  /** Fija la primera columna al hacer scroll horizontal en móvil */
  stickyFirst?: boolean;
}

export function DataTable<T>({
  columnas,
  datos,
  keyExtractor,
  cargando,
  onRowClick,
  rowClassName,
  stickyFirst = false,
}: DataTableProps<T>) {
  if (cargando) return <SkeletonCard variant="table" className="w-full" />;

  return (
    <div
      className="overflow-x-auto rounded-xl border border-[#E4E4E7]"
      style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#F4F4F5] border-b border-[#E4E4E7]">
            {columnas.map((col, colIdx) => (
              <th
                key={col.key}
                className={clsx(
                  "px-4 py-3 text-left text-[11px] font-bold text-[#52525B] uppercase tracking-[0.1em] whitespace-nowrap",
                  stickyFirst && colIdx === 0 && "sticky left-0 z-10 bg-[#F4F4F5]",
                  col.headerClassName
                )}
              >
                {col.helpKey ? (
                  <Tooltip short={col.header} help={HELP[col.helpKey]}>
                    <span className="cursor-help">{col.header}</span>
                  </Tooltip>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datos.map((row, idx) => (
            <tr
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onRowClick?.(row); } }}
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? "button" : undefined}
              aria-label={onRowClick ? `Ver detalle de ${keyExtractor(row)}` : undefined}
              className={clsx(
                "border-b border-[#F4F4F5] last:border-0",
                "transition-colors duration-150",
                idx % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]",
                onRowClick && "cursor-pointer hover:bg-[#F4F4F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B45309] focus-visible:outline-offset-[-2px]",
                rowClassName?.(row)
              )}
            >
              {columnas.map((col, colIdx) => (
                <td
                  key={col.key}
                  className={clsx(
                    "px-4 py-3 text-[#3F3F46] whitespace-nowrap",
                    stickyFirst && colIdx === 0 && "sticky left-0 z-10 bg-inherit",
                    col.className
                  )}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {datos.length === 0 && (
        <div className="flex items-center justify-center h-24 text-[13px] text-[#A1A1AA]">
          Sin datos disponibles
        </div>
      )}
    </div>
  );
}
