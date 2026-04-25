"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { clsx } from "clsx";

/* ------------------------------------------------------------------ */
/*  EntityNode — nodo ER con campos, PK/FK, colores por categoría     */
/* ------------------------------------------------------------------ */

interface FieldDef {
  name: string;
  type: string;
  pk?: boolean;
  fk?: boolean;
}

interface EntityData {
  label: string;
  tag?: string;
  headerBg: string;
  headerText: string;
  borderColor: string;
  fields?: FieldDef[];
  compact?: boolean;
}

export const EntityNode = memo(function EntityNode({
  data,
  selected,
}: NodeProps & { data: EntityData }) {
  const d = data as EntityData;
  return (
    <div
      className={clsx(
        "rounded-lg border-2 min-w-[180px] text-left",
        "transition-all duration-200",
        selected
          ? "shadow-lg ring-2 ring-amber-400/60 scale-[1.02]"
          : "shadow-sm hover:shadow-md"
      )}
      style={{
        borderColor: d.borderColor,
        backgroundColor: "#fff",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-gray-300 !border-gray-400"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-t"
        className="!w-2 !h-2 !bg-gray-300 !border-gray-400"
      />

      {/* Header */}
      <div
        className="px-3 py-2 rounded-t-[5px] flex items-center gap-2"
        style={{ backgroundColor: d.headerBg, color: d.headerText }}
      >
        <span className="text-xs font-bold leading-tight">{d.label}</span>
        {d.tag && (
          <span className="text-[9px] opacity-70 font-medium">[{d.tag}]</span>
        )}
      </div>

      {/* Fields */}
      {d.fields && !d.compact && (
        <div className="divide-y divide-gray-100">
          {d.fields.map((f, i) => (
            <div
              key={i}
              className="px-3 py-[3px] text-[11px] flex items-center gap-1.5"
            >
              <span
                className={clsx(
                  "truncate",
                  f.pk && "font-bold text-[#09090B]",
                  f.fk && "text-[#3F3F46]"
                )}
              >
                {f.name}
              </span>
              <span className="text-gray-400 ml-auto text-[10px] shrink-0">
                {f.type}
              </span>
              {f.pk && (
                <span className="text-[8px] font-bold text-amber-700 bg-amber-50 px-1 rounded shrink-0">
                  PK
                </span>
              )}
              {f.fk && (
                <span className="text-[8px] font-bold text-blue-700 bg-blue-50 px-1 rounded shrink-0">
                  FK
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-gray-300 !border-gray-400"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-s"
        className="!w-2 !h-2 !bg-gray-300 !border-gray-400"
      />
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  ProcessNode — nodo para diagramas de flujo y arquitectura          */
/* ------------------------------------------------------------------ */

interface ProcessData {
  label: string;
  sublabel?: string;
  shape: "oval" | "box" | "diamond" | "cylinder" | "rounded";
  bg: string;
  borderColor: string;
  textColor?: string;
}

export const ProcessNode = memo(function ProcessNode({
  data,
  selected,
}: NodeProps & { data: ProcessData }) {
  const d = data as ProcessData;
  const shapeClass: Record<string, string> = {
    oval: "rounded-full px-5 py-3",
    box: "rounded-md px-4 py-3",
    diamond: "rotate-45 px-3 py-3",
    cylinder: "rounded-lg px-4 py-3 border-t-4",
    rounded: "rounded-xl px-4 py-3",
  };

  return (
    <div
      className={clsx(
        "border-2 text-center min-w-[100px]",
        "transition-all duration-200",
        shapeClass[d.shape] || shapeClass.box,
        selected ? "shadow-lg ring-2 ring-amber-400/60" : "shadow-sm"
      )}
      style={{
        backgroundColor: d.bg,
        borderColor: d.borderColor,
        color: d.textColor || "#09090B",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-gray-300 !border-gray-400"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-t"
        className="!w-2 !h-2 !bg-gray-300 !border-gray-400"
      />

      <div className={d.shape === "diamond" ? "-rotate-45" : ""}>
        <div className="text-xs font-semibold leading-tight whitespace-pre-line">
          {d.label}
        </div>
        {d.sublabel && (
          <div className="text-[10px] opacity-70 mt-0.5 leading-tight">
            {d.sublabel}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-gray-300 !border-gray-400"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-s"
        className="!w-2 !h-2 !bg-gray-300 !border-gray-400"
      />
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  GroupNode — nodo contenedor para capas / clusters                   */
/* ------------------------------------------------------------------ */

interface GroupData {
  label: string;
  bg: string;
  borderColor: string;
  textColor: string;
  width: number;
  height: number;
}

export const GroupNode = memo(function GroupNode({
  data,
}: NodeProps & { data: GroupData }) {
  const d = data as GroupData;
  return (
    <div
      className="rounded-xl border-2 border-dashed"
      style={{
        backgroundColor: d.bg,
        borderColor: d.borderColor,
        width: d.width,
        height: d.height,
        position: "relative",
      }}
    >
      <div
        className="absolute -top-3 left-4 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded"
        style={{
          backgroundColor: d.borderColor,
          color: "#fff",
        }}
      >
        {d.label}
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Exportar nodeTypes para ReactFlow                                   */
/* ------------------------------------------------------------------ */

export const DIAGRAM_NODE_TYPES = {
  entity: EntityNode,
  process: ProcessNode,
  group: GroupNode,
} as const;
