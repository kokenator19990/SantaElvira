"use client";

import { useCallback, useEffect, useRef, useState, type ElementType } from "react";
import type { Node, Edge } from "@xyflow/react";
import {
  AlertCircle,
  Table2,
  GitBranch,
  Target,
  FlaskConical,
  Workflow,
  List,
  ArrowLeftRight,
  Rocket,
  Cpu,
  ChevronDown,
  ChevronRight,
  Database,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

import {
  InteractiveDiagram,
  type DiagramSection,
} from "@/components/docs/lazy";
import { StepNav, type Step } from "@/components/docs/StepNav";
import { EntityDetail, type EntityInfo } from "@/components/docs/EntityDetail";

/* ================================================================== */
/*  ENTITY DATA — 9 entidades con campos, relaciones                  */
/* ================================================================== */

const ENTITIES: EntityInfo[] = [
  {
    id: "TIPO_FLOTA",
    nombre: "TIPO_FLOTA",
    descripcion:
      "Catalogo de tipos de equipos (CAT 785D, 777F, 992, Komatsu PC-2000)",
    headerBg: "#E8F4FD",
    headerText: "#1A5276",
    borderColor: "#1A5276",
    campos: [
      { name: "id", type: "TEXT", pk: true, ejemplo: "785D" },
      { name: "codigo", type: "TEXT", ejemplo: "785D" },
      {
        name: "descripcion",
        type: "TEXT",
        ejemplo: "Camion de acarreo 785D",
      },
      { name: "fabricante", type: "TEXT", ejemplo: "Caterpillar" },
    ],
    relaciones: [
      { target: "EQUIPO", tipo: "1:N", label: "Clasifica equipos" },
    ],
  },
  {
    id: "EQUIPO",
    nombre: "EQUIPO",
    descripcion: "Los 28 equipos fisicos de la mina",
    headerBg: "#E8F4FD",
    headerText: "#1A5276",
    borderColor: "#1A5276",
    campos: [
      { name: "id", type: "TEXT", pk: true, ejemplo: "CH-01" },
      { name: "tipo_flota_id", type: "TEXT", fk: true, ejemplo: "785D" },
      { name: "modelo", type: "TEXT", ejemplo: "CAT 785D" },
      { name: "anio_fabricacion", type: "INT", ejemplo: "2018" },
      { name: "en_servicio", type: "BOOL", ejemplo: "true" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
    relaciones: [
      { target: "KPI_EQUIPO", tipo: "1:N", label: "KPIs mensuales" },
      { target: "ASARCO_EQUIPO", tipo: "1:N", label: "Distribucion horas" },
      { target: "ALERTA", tipo: "1:N", label: "Alertas generadas" },
      { target: "MUESTRA_APD", tipo: "1:N", label: "Muestras de aceite" },
    ],
  },
  {
    id: "PERIODO",
    nombre: "PERIODO",
    descripcion: "Cada mes/ano del que se registran datos",
    headerBg: "#EAF4E8",
    headerText: "#1E8449",
    borderColor: "#1E8449",
    campos: [
      { name: "id", type: "INT", pk: true },
      { name: "anio", type: "INT", ejemplo: "2025" },
      { name: "mes", type: "INT", ejemplo: "4" },
      { name: "label", type: "TEXT", ejemplo: "Abril 2025" },
      { name: "cerrado", type: "BOOL" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
    relaciones: [
      { target: "KPI_EQUIPO", tipo: "1:N", label: "KPIs del mes" },
      { target: "ASARCO_EQUIPO", tipo: "1:N", label: "ASARCO del mes" },
      { target: "ALERTA", tipo: "1:N", label: "Alertas del mes" },
      { target: "ANALISIS_APD", tipo: "1:N", label: "Analisis del mes" },
    ],
  },
  {
    id: "KPI_EQUIPO",
    nombre: "KPI_EQUIPO",
    descripcion: "KPIs mensuales de cada equipo (DFM, TMEF, TMPR)",
    headerBg: "#FDF2E9",
    headerText: "#CA6F1E",
    borderColor: "#CA6F1E",
    campos: [
      { name: "id", type: "INT", pk: true },
      { name: "equipo_id", type: "TEXT", fk: true },
      { name: "periodo_id", type: "INT", fk: true },
      {
        name: "dfm",
        type: "DECIMAL(5,2)",
        ejemplo: "87.50",
        descripcion: "Disponibilidad Fisica Mecanica",
      },
      {
        name: "tmef",
        type: "DECIMAL(6,1)",
        ejemplo: "92.3",
        descripcion: "Tiempo Medio Entre Fallas (horas)",
      },
      {
        name: "tmpr",
        type: "DECIMAL(5,1)",
        ejemplo: "4.2",
        descripcion: "Tiempo Medio de Parada por Reparacion (horas)",
      },
      {
        name: "tiempo_operativo",
        type: "DECIMAL(5,2)",
        ejemplo: "72.50",
        descripcion: "Porcentaje del periodo en operacion",
      },
      {
        name: "reserva",
        type: "DECIMAL(5,2)",
        ejemplo: "8.30",
        descripcion: "Porcentaje en reserva",
      },
      { name: "horas_acumuladas", type: "INT", ejemplo: "14520" },
      { name: "paro_total", type: "BOOL", ejemplo: "false" },
      { name: "motivo_paro", type: "TEXT", ejemplo: "null" },
      { name: "creado_por", type: "TEXT", fk: true, ejemplo: "supervisor01" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
    relaciones: [
      { target: "EQUIPO", tipo: "N:1", label: "Pertenece a equipo" },
      { target: "PERIODO", tipo: "N:1", label: "Pertenece a mes" },
    ],
  },
  {
    id: "ASARCO_EQUIPO",
    nombre: "ASARCO_EQUIPO",
    descripcion: "Distribucion de horas segun metodologia ASARCO",
    headerBg: "#FDF2E9",
    headerText: "#CA6F1E",
    borderColor: "#CA6F1E",
    campos: [
      { name: "id", type: "INT", pk: true },
      { name: "equipo_id", type: "TEXT", fk: true },
      { name: "periodo_id", type: "INT", fk: true },
      { name: "pct_operativo", type: "DECIMAL(5,2)", ejemplo: "72.50" },
      { name: "pct_reserva", type: "DECIMAL(5,2)", ejemplo: "8.30" },
      { name: "pct_det_programada", type: "DECIMAL(5,2)", ejemplo: "10.20" },
      { name: "pct_det_no_prog", type: "DECIMAL(5,2)", ejemplo: "5.80" },
      { name: "pct_perdida_op", type: "DECIMAL(5,2)", ejemplo: "3.20" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
    relaciones: [
      { target: "EQUIPO", tipo: "N:1", label: "Pertenece a equipo" },
      { target: "PERIODO", tipo: "N:1", label: "Pertenece a mes" },
    ],
  },
  {
    id: "UMBRAL_KPI",
    nombre: "UMBRAL_KPI",
    descripcion: "Limites verde/ambar/rojo por KPI",
    headerBg: "#EAF4E8",
    headerText: "#1E8449",
    borderColor: "#1E8449",
    campos: [
      { name: "id", type: "INT", pk: true },
      {
        name: "kpi",
        type: "TEXT",
        ejemplo: "dfm",
        descripcion: "Nombre del KPI (dfm, tmef, tmpr)",
      },
      {
        name: "nivel_verde",
        type: "DECIMAL",
        ejemplo: "85.0",
        descripcion: "Valor minimo para semaforo verde",
      },
      {
        name: "nivel_ambar",
        type: "DECIMAL",
        ejemplo: "75.0",
        descripcion: "Valor minimo para semaforo ambar",
      },
      { name: "vigente_desde", type: "DATE", ejemplo: "2025-01-01" },
      { name: "vigente_hasta", type: "DATE", ejemplo: "null" },
    ],
    relaciones: [
      { target: "KPI_EQUIPO", tipo: "1:N", label: "Define semaforo" },
    ],
  },
  {
    id: "ALERTA",
    nombre: "ALERTA",
    descripcion: "Alertas generadas cuando un KPI supera un umbral",
    headerBg: "#FDEDEC",
    headerText: "#C0392B",
    borderColor: "#C0392B",
    campos: [
      { name: "id", type: "INT", pk: true },
      { name: "equipo_id", type: "TEXT", fk: true },
      { name: "periodo_id", type: "INT", fk: true },
      { name: "kpi", type: "TEXT", ejemplo: "dfm" },
      { name: "valor_actual", type: "DECIMAL", ejemplo: "68.5" },
      { name: "umbral_critico", type: "DECIMAL", ejemplo: "75.0" },
      { name: "estado", type: "TEXT", ejemplo: "critico" },
      {
        name: "mensaje",
        type: "TEXT",
        ejemplo: "DFM por debajo del umbral critico",
      },
      { name: "resuelta", type: "BOOL", ejemplo: "false" },
      { name: "timestamp", type: "TIMESTAMP" },
    ],
    relaciones: [
      { target: "EQUIPO", tipo: "N:1", label: "Del equipo" },
      { target: "PERIODO", tipo: "N:1", label: "Del mes" },
    ],
  },
  {
    id: "ANALISIS_APD",
    nombre: "ANALISIS_APD",
    descripcion: "Sesion de carga de analisis de aceite (CSV)",
    headerBg: "#F4ECF7",
    headerText: "#7D3C98",
    borderColor: "#7D3C98",
    campos: [
      { name: "id", type: "INT", pk: true },
      { name: "periodo_id", type: "INT", fk: true },
      { name: "fecha_analisis", type: "DATE", ejemplo: "2025-04-15" },
      { name: "archivo_origen", type: "TEXT", ejemplo: "APD_Abril2025.csv" },
      { name: "creado_por", type: "TEXT", fk: true, ejemplo: "tecnico01" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
    relaciones: [
      { target: "PERIODO", tipo: "N:1", label: "Del mes" },
      { target: "MUESTRA_APD", tipo: "1:N", label: "Contiene muestras" },
    ],
  },
  {
    id: "MUESTRA_APD",
    nombre: "MUESTRA_APD",
    descripcion: "Cada resultado individual del analisis de aceite",
    headerBg: "#F4ECF7",
    headerText: "#7D3C98",
    borderColor: "#7D3C98",
    campos: [
      { name: "id", type: "INT", pk: true },
      { name: "analisis_id", type: "INT", fk: true },
      { name: "equipo_id", type: "TEXT", fk: true },
      { name: "compartimento", type: "TEXT", ejemplo: "Motor" },
      { name: "parametro", type: "TEXT", ejemplo: "Viscosidad" },
      { name: "valor", type: "DECIMAL", ejemplo: "14.2" },
      { name: "unidad", type: "TEXT", ejemplo: "cSt" },
      { name: "limite_minimo", type: "DECIMAL", ejemplo: "12.0" },
      { name: "limite_maximo", type: "DECIMAL", ejemplo: "16.0" },
      { name: "estado", type: "TEXT", ejemplo: "verde" },
    ],
    relaciones: [
      { target: "ANALISIS_APD", tipo: "N:1", label: "Parte del analisis" },
      { target: "EQUIPO", tipo: "N:1", label: "Del equipo" },
    ],
  },
];

/* ================================================================== */
/*  STEPS — navegacion lateral                                        */
/* ================================================================== */

const STEPS: Step[] = [
  { id: "contexto", label: "Contexto", icon: AlertCircle },
  { id: "entidades", label: "Entidades", icon: Table2 },
  { id: "er-completo", label: "Diagrama ER", icon: GitBranch },
  { id: "nucleo", label: "Nucleo", icon: Target },
  { id: "apd", label: "APD", icon: FlaskConical },
  { id: "flujo", label: "Flujo", icon: Workflow },
  { id: "detalle", label: "Detalle", icon: List },
  { id: "comparacion", label: "Comparacion", icon: ArrowLeftRight },
  { id: "migracion", label: "Migracion", icon: Rocket },
  { id: "tecnologia", label: "Tecnologia", icon: Cpu },
];

/* ================================================================== */
/*  ENTITY CARD META — info breve para grilla de tarjetas             */
/* ================================================================== */

interface EntityCard {
  id: string;
  name: string;
  desc: string;
  fields: number;
  color: string;
  tag?: string;
}

const ENTITY_CARDS: EntityCard[] = [
  {
    id: "TIPO_FLOTA",
    name: "TIPO_FLOTA",
    desc: "Catalogo de tipos de equipos (CAT 785D, 777F, 992, Komatsu PC-2000)",
    fields: 4,
    color: "#1A5276",
  },
  {
    id: "EQUIPO",
    name: "EQUIPO",
    desc: "Los 28 equipos fisicos de la mina",
    fields: 6,
    color: "#1A5276",
  },
  {
    id: "PERIODO",
    name: "PERIODO",
    desc: "Cada mes/ano del que se registran datos",
    fields: 6,
    color: "#1E8449",
  },
  {
    id: "KPI_EQUIPO",
    name: "KPI_EQUIPO",
    desc: "KPIs mensuales de cada equipo (DFM, TMEF, TMPR)",
    fields: 13,
    color: "#CA6F1E",
    tag: "CENTRAL",
  },
  {
    id: "ASARCO_EQUIPO",
    name: "ASARCO_EQUIPO",
    desc: "Distribucion de horas segun metodologia ASARCO",
    fields: 9,
    color: "#CA6F1E",
  },
  {
    id: "UMBRAL_KPI",
    name: "UMBRAL_KPI",
    desc: "Limites verde/ambar/rojo por KPI",
    fields: 6,
    color: "#1E8449",
  },
  {
    id: "ALERTA",
    name: "ALERTA",
    desc: "Alertas generadas cuando un KPI supera un umbral",
    fields: 10,
    color: "#C0392B",
  },
  {
    id: "ANALISIS_APD",
    name: "ANALISIS_APD",
    desc: "Sesion de carga de analisis de aceite (CSV)",
    fields: 6,
    color: "#7D3C98",
  },
  {
    id: "MUESTRA_APD",
    name: "MUESTRA_APD",
    desc: "Cada resultado individual del analisis de aceite",
    fields: 10,
    color: "#7D3C98",
  },
];

/* ================================================================== */
/*  ER COMPLETO — nodos y edges                                       */
/* ================================================================== */

function makeEntityNode(
  id: string,
  x: number,
  y: number,
  entity: EntityInfo,
  tag?: string
): Node {
  return {
    id,
    type: "entity",
    position: { x, y },
    data: {
      label: entity.nombre,
      tag,
      headerBg: entity.headerBg,
      headerText: entity.headerText,
      borderColor: entity.borderColor,
      fields: entity.campos.map((c) => ({
        name: c.name,
        type: c.type,
        pk: c.pk,
        fk: c.fk,
      })),
    },
  };
}

function getEntity(id: string): EntityInfo {
  return ENTITIES.find((e) => e.id === id)!;
}

const ER_NODES: Node[] = [
  /* ── Fila 0 — Referencia / configuracion (arriba) ── */
  makeEntityNode("TIPO_FLOTA", 0, 0, getEntity("TIPO_FLOTA")),
  makeEntityNode("UMBRAL_KPI", 320, 0, getEntity("UMBRAL_KPI")),

  /* ── Fila 1 — Hubs centrales ── */
  makeEntityNode("EQUIPO", 0, 350, getEntity("EQUIPO")),
  makeEntityNode("PERIODO", 620, 230, getEntity("PERIODO")),
  makeEntityNode("ANALISIS_APD", 940, 230, getEntity("ANALISIS_APD")),

  /* ── Fila 2 — Entidades operacionales (datos mensuales) ── */
  makeEntityNode("ALERTA", 0, 640, getEntity("ALERTA")),
  makeEntityNode("KPI_EQUIPO", 310, 620, getEntity("KPI_EQUIPO"), "CENTRAL"),
  makeEntityNode("ASARCO_EQUIPO", 630, 620, getEntity("ASARCO_EQUIPO")),
  makeEntityNode("MUESTRA_APD", 940, 620, getEntity("MUESTRA_APD")),
];

const ER_EDGES: Edge[] = [
  /* ── TIPO_FLOTA -> EQUIPO ── */
  {
    id: "e-tf-eq",
    source: "TIPO_FLOTA",
    target: "EQUIPO",
    type: "smoothstep",
    animated: true,
    label: "1:N clasifica",
    style: { stroke: "#1A5276", strokeWidth: 2 },
    labelStyle: { fontSize: 11, fontWeight: 600 },
  },

  /* ── EQUIPO -> hijos (azul) — 3 salidas bottom distribuidas ── */
  {
    id: "e-eq-ale",
    source: "EQUIPO",
    target: "ALERTA",
    sourceHandle: "bottom-s-1",
    type: "smoothstep",
    animated: true,
    label: "1:N",
    style: { stroke: "#1A5276", strokeWidth: 2 },
    labelStyle: { fontSize: 11, fontWeight: 600 },
  },
  {
    id: "e-eq-kpi",
    source: "EQUIPO",
    target: "KPI_EQUIPO",
    sourceHandle: "bottom-s-3",
    targetHandle: "top-t-1",
    type: "smoothstep",
    animated: true,
    label: "1:N",
    style: { stroke: "#1A5276", strokeWidth: 2 },
    labelStyle: { fontSize: 11, fontWeight: 600 },
  },
  {
    id: "e-eq-asc",
    source: "EQUIPO",
    target: "ASARCO_EQUIPO",
    sourceHandle: "right-s",
    targetHandle: "top-t-1",
    type: "smoothstep",
    animated: true,
    label: "1:N",
    style: { stroke: "#1A5276", strokeWidth: 1.5 },
    labelStyle: { fontSize: 10 },
  },
  {
    id: "e-eq-map",
    source: "EQUIPO",
    target: "MUESTRA_APD",
    sourceHandle: "right-s",
    targetHandle: "left-t",
    type: "smoothstep",
    animated: true,
    label: "1:N",
    style: { stroke: "#1A5276", strokeWidth: 1, strokeDasharray: "4 3" },
    labelStyle: { fontSize: 10, opacity: 0.7 },
  },

  /* ── PERIODO -> hijos (verde) — salidas distribuidas ── */
  {
    id: "e-per-kpi",
    source: "PERIODO",
    target: "KPI_EQUIPO",
    sourceHandle: "bottom-s-1",
    targetHandle: "top-t-3",
    type: "smoothstep",
    animated: true,
    label: "1:N",
    style: { stroke: "#1E8449", strokeWidth: 2 },
    labelStyle: { fontSize: 11, fontWeight: 600 },
  },
  {
    id: "e-per-asc",
    source: "PERIODO",
    target: "ASARCO_EQUIPO",
    sourceHandle: "bottom-s-3",
    targetHandle: "top-t-3",
    type: "smoothstep",
    animated: true,
    label: "1:N",
    style: { stroke: "#1E8449", strokeWidth: 2 },
    labelStyle: { fontSize: 11, fontWeight: 600 },
  },
  {
    id: "e-per-ale",
    source: "PERIODO",
    target: "ALERTA",
    sourceHandle: "left-s",
    targetHandle: "right-t",
    type: "smoothstep",
    animated: true,
    label: "1:N",
    style: { stroke: "#1E8449", strokeWidth: 1, strokeDasharray: "4 3" },
    labelStyle: { fontSize: 10, opacity: 0.7 },
  },
  {
    id: "e-per-apd",
    source: "PERIODO",
    target: "ANALISIS_APD",
    sourceHandle: "right-s",
    targetHandle: "left-t",
    type: "smoothstep",
    animated: true,
    label: "1:N",
    style: { stroke: "#1E8449", strokeWidth: 2 },
    labelStyle: { fontSize: 11, fontWeight: 600 },
  },

  /* ── APD cadena (purpura) ── */
  {
    id: "e-apd-mue",
    source: "ANALISIS_APD",
    target: "MUESTRA_APD",
    type: "smoothstep",
    animated: true,
    label: "1:N",
    style: { stroke: "#7D3C98", strokeWidth: 2 },
    labelStyle: { fontSize: 11, fontWeight: 600 },
  },

  /* ── UMBRAL -> KPI_EQUIPO (ambar punteado, al centro) ── */
  {
    id: "e-umb-kpi",
    source: "UMBRAL_KPI",
    target: "KPI_EQUIPO",
    type: "smoothstep",
    animated: false,
    label: "define semaforo",
    style: { stroke: "#B45309", strokeWidth: 1.5, strokeDasharray: "6 3" },
    labelStyle: { fontSize: 10, fontWeight: 600, fill: "#92400E" },
  },
];

const ER_SECTIONS: DiagramSection[] = [
  {
    id: "modulo-kpi",
    label: "Modulo KPI",
    nodeIds: [
      "TIPO_FLOTA",
      "EQUIPO",
      "PERIODO",
      "KPI_EQUIPO",
      "ASARCO_EQUIPO",
      "UMBRAL_KPI",
    ],
  },
  {
    id: "modulo-apd",
    label: "Modulo APD",
    nodeIds: ["EQUIPO", "PERIODO", "ANALISIS_APD", "MUESTRA_APD"],
  },
  {
    id: "alertas",
    label: "Alertas",
    nodeIds: ["EQUIPO", "PERIODO", "KPI_EQUIPO", "ALERTA", "UMBRAL_KPI"],
  },
];

/* ================================================================== */
/*  NUCLEO — 5 entidades centrales                                    */
/* ================================================================== */

const NUCLEO_NODES: Node[] = [
  makeEntityNode("TIPO_FLOTA", 30, 0, getEntity("TIPO_FLOTA")),
  makeEntityNode("EQUIPO", 30, 160, getEntity("EQUIPO")),
  makeEntityNode("PERIODO", 350, 0, getEntity("PERIODO")),
  makeEntityNode(
    "KPI_EQUIPO",
    180,
    350,
    getEntity("KPI_EQUIPO"),
    "CENTRAL"
  ),
  makeEntityNode("UMBRAL_KPI", 480, 200, getEntity("UMBRAL_KPI")),
];

const NUCLEO_EDGES: Edge[] = [
  {
    id: "n-tf-eq",
    source: "TIPO_FLOTA",
    target: "EQUIPO",
    type: "smoothstep",
    animated: true,
    label: "1:N",
    style: { stroke: "#1A5276" },
  },
  {
    id: "n-eq-kpi",
    source: "EQUIPO",
    target: "KPI_EQUIPO",
    targetHandle: "top-t-1",
    type: "smoothstep",
    animated: true,
    label: "1:N",
    style: { stroke: "#1A5276" },
  },
  {
    id: "n-per-kpi",
    source: "PERIODO",
    target: "KPI_EQUIPO",
    targetHandle: "top-t-3",
    type: "smoothstep",
    animated: true,
    label: "1:N",
    style: { stroke: "#1E8449" },
  },
  {
    id: "n-umb-kpi",
    source: "UMBRAL_KPI",
    target: "KPI_EQUIPO",
    type: "smoothstep",
    animated: true,
    label: "define semaforo",
    style: { stroke: "#1E8449", strokeDasharray: "6 3" },
  },
];

/* ================================================================== */
/*  APD — 4 entidades del modulo aceite                               */
/* ================================================================== */

const APD_NODES: Node[] = [
  makeEntityNode("EQUIPO",       680,   0, getEntity("EQUIPO")),
  makeEntityNode("PERIODO",        0, 240, getEntity("PERIODO")),
  makeEntityNode("ANALISIS_APD", 340, 240, getEntity("ANALISIS_APD")),
  makeEntityNode("MUESTRA_APD",  680, 240, getEntity("MUESTRA_APD")),
];

const APD_EDGES: Edge[] = [
  {
    id: "a-per-apd",
    source: "PERIODO",
    sourceHandle: "right-s",
    target: "ANALISIS_APD",
    targetHandle: "left-t",
    type: "smoothstep",
    animated: true,
    label: "1:N",
    style: { stroke: "#1E8449" },
  },
  {
    id: "a-apd-mue",
    source: "ANALISIS_APD",
    sourceHandle: "right-s",
    target: "MUESTRA_APD",
    targetHandle: "left-t",
    type: "smoothstep",
    animated: true,
    label: "1:N",
    style: { stroke: "#7D3C98" },
  },
  {
    id: "a-eq-mue",
    source: "EQUIPO",
    sourceHandle: "bottom-s-3",
    target: "MUESTRA_APD",
    targetHandle: "top-t-3",
    type: "smoothstep",
    animated: true,
    label: "1:N",
    style: { stroke: "#1A5276" },
  },
];

/* ================================================================== */
/*  FLUJO DE DATOS — nodos proceso                                    */
/* ================================================================== */

const FLOW_NODES: Node[] = [
  // Path 1 — KPIs
  {
    id: "f-start",
    type: "process",
    position: { x: 60, y: 0 },
    data: {
      label: "Supervisor abre\nsistema",
      shape: "oval",
      bg: "#E8F4FD",
      borderColor: "#1A5276",
      textColor: "#1A5276",
    },
  },
  {
    id: "f-form",
    type: "process",
    position: { x: 40, y: 90 },
    data: {
      label: "Formulario web\n28 equipos",
      shape: "box",
      bg: "#F4F4F5",
      borderColor: "#71717A",
      textColor: "#3F3F46",
    },
  },
  {
    id: "f-kpi-input",
    type: "process",
    position: { x: 45, y: 180 },
    data: {
      label: "Ingresa KPIs\n(DFM, TMEF, TMPR)",
      shape: "box",
      bg: "#FDF2E9",
      borderColor: "#CA6F1E",
      textColor: "#CA6F1E",
    },
  },
  {
    id: "f-api",
    type: "process",
    position: { x: 55, y: 270 },
    data: {
      label: "API valida\nlos datos",
      shape: "box",
      bg: "#E8F4FD",
      borderColor: "#1A5276",
      textColor: "#1A5276",
    },
  },
  {
    id: "f-insert-kpi",
    type: "process",
    position: { x: 25, y: 360 },
    data: {
      label: "INSERT\nKPI_EQUIPO",
      shape: "cylinder",
      bg: "#EAF4E8",
      borderColor: "#1E8449",
      textColor: "#1E8449",
    },
  },
  {
    id: "f-insert-asarco",
    type: "process",
    position: { x: 195, y: 360 },
    data: {
      label: "INSERT\nASARCO_EQUIPO",
      shape: "cylinder",
      bg: "#EAF4E8",
      borderColor: "#1E8449",
      textColor: "#1E8449",
    },
  },
  {
    id: "f-check",
    type: "process",
    position: { x: 70, y: 460 },
    data: {
      label: "Compara vs\nUMBRAL?",
      shape: "diamond",
      bg: "#FFFFFF",
      borderColor: "#B45309",
      textColor: "#B45309",
    },
  },
  {
    id: "f-alert",
    type: "process",
    position: { x: 0, y: 570 },
    data: {
      label: "INSERT\nALERTA",
      sublabel: "Fuera de umbral",
      shape: "cylinder",
      bg: "#FDEDEC",
      borderColor: "#C0392B",
      textColor: "#C0392B",
    },
  },
  {
    id: "f-green",
    type: "process",
    position: { x: 195, y: 570 },
    data: {
      label: "Semaforo\nverde",
      sublabel: "Dentro de umbral",
      shape: "box",
      bg: "#EAF4E8",
      borderColor: "#15803D",
      textColor: "#15803D",
    },
  },
  {
    id: "f-dashboard",
    type: "process",
    position: { x: 70, y: 680 },
    data: {
      label: "Dashboard\nactualizado",
      shape: "rounded",
      bg: "#F4ECF7",
      borderColor: "#7D3C98",
      textColor: "#7D3C98",
    },
  },
  // Path 2 — APD
  {
    id: "f-csv",
    type: "process",
    position: { x: 450, y: 0 },
    data: {
      label: "Tecnico\nsube CSV",
      shape: "oval",
      bg: "#F4ECF7",
      borderColor: "#7D3C98",
      textColor: "#7D3C98",
    },
  },
  {
    id: "f-insert-apd",
    type: "process",
    position: { x: 430, y: 120 },
    data: {
      label: "ANALISIS_APD +\nMUESTRA_APD",
      shape: "cylinder",
      bg: "#F4ECF7",
      borderColor: "#7D3C98",
      textColor: "#7D3C98",
    },
  },
  {
    id: "f-vista-apd",
    type: "process",
    position: { x: 435, y: 250 },
    data: {
      label: "Vista APD\nsemaforos",
      shape: "box",
      bg: "#F4ECF7",
      borderColor: "#7D3C98",
      textColor: "#7D3C98",
    },
  },
  {
    id: "f-export",
    type: "process",
    position: { x: 440, y: 370 },
    data: {
      label: "Reporte\nexportado",
      shape: "oval",
      bg: "#F4ECF7",
      borderColor: "#7D3C98",
      textColor: "#7D3C98",
    },
  },
];

const FLOW_EDGES: Edge[] = [
  // Path 1
  {
    id: "fe-1",
    source: "f-start",
    target: "f-form",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#71717A" },
  },
  {
    id: "fe-2",
    source: "f-form",
    target: "f-kpi-input",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#71717A" },
  },
  {
    id: "fe-3",
    source: "f-kpi-input",
    target: "f-api",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#71717A" },
  },
  {
    id: "fe-4a",
    source: "f-api",
    target: "f-insert-kpi",
    sourceHandle: "bottom-s-1",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#1E8449" },
  },
  {
    id: "fe-4b",
    source: "f-api",
    target: "f-insert-asarco",
    sourceHandle: "bottom-s-3",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#1E8449" },
  },
  {
    id: "fe-5",
    source: "f-insert-kpi",
    target: "f-check",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#B45309" },
  },
  {
    id: "fe-6a",
    source: "f-check",
    target: "f-alert",
    sourceHandle: "bottom-s-1",
    type: "smoothstep",
    animated: true,
    label: "Fuera",
    style: { stroke: "#C0392B" },
  },
  {
    id: "fe-6b",
    source: "f-check",
    target: "f-green",
    sourceHandle: "bottom-s-3",
    type: "smoothstep",
    animated: true,
    label: "OK",
    style: { stroke: "#15803D" },
  },
  {
    id: "fe-7a",
    source: "f-alert",
    target: "f-dashboard",
    targetHandle: "top-t-1",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#71717A" },
  },
  {
    id: "fe-7b",
    source: "f-green",
    target: "f-dashboard",
    targetHandle: "top-t-3",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#71717A" },
  },
  // Path 2
  {
    id: "fe-p2-1",
    source: "f-csv",
    target: "f-insert-apd",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#7D3C98" },
  },
  {
    id: "fe-p2-2",
    source: "f-insert-apd",
    target: "f-vista-apd",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#7D3C98" },
  },
  {
    id: "fe-p2-3",
    source: "f-vista-apd",
    target: "f-export",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#7D3C98" },
  },
];

/* ================================================================== */
/*  COMPARACION — filas                                               */
/* ================================================================== */

const COMPARACION_ROWS = [
  {
    aspecto: "Datos",
    hoy: "Escritos en codigo TypeScript",
    db: "Almacenados en PostgreSQL",
  },
  {
    aspecto: "Cambiar un KPI",
    hoy: "Requiere editar codigo y republicar",
    db: "Formulario web sin tocar codigo",
  },
  {
    aspecto: "Historial",
    hoy: "Solo 6 meses fijos",
    db: "Acumulacion ilimitada",
  },
  {
    aspecto: "Alertas",
    hoy: "Recalculadas en cada carga",
    db: "Persistidas con historial",
  },
  {
    aspecto: "APD",
    hoy: "Se pierde al recargar",
    db: "Guardado permanentemente",
  },
  {
    aspecto: "Umbrales",
    hoy: "Constantes en codigo",
    db: "Tabla configurable",
  },
  {
    aspecto: "Trazabilidad",
    hoy: "Ninguna",
    db: "Quien cargo que dato y cuando",
  },
  {
    aspecto: "Exportar Excel",
    hoy: "No disponible",
    db: "Exportacion por periodo",
  },
  {
    aspecto: "Importar Excel",
    hoy: "Solo APD parcialmente",
    db: "Importacion completa de KPIs",
  },
];

/* ================================================================== */
/*  MIGRACION — fases                                                 */
/* ================================================================== */

const MIGRACION_PHASES = [
  {
    phase: 0,
    title: "Validar",
    desc: "Revisar modelo, mapear Excels, confirmar Supabase",
    bg: "#EAF4E8",
    border: "#15803D",
    text: "#15803D",
  },
  {
    phase: 1,
    title: "Crear DB",
    desc: "Crear proyecto Supabase, ejecutar SQL, cargar datos fijos",
    bg: "#E8F4FD",
    border: "#1A5276",
    text: "#1A5276",
  },
  {
    phase: 2,
    title: "Migrar",
    desc: "Importar 6 meses historicos, validar semaforos",
    bg: "#FDF2E9",
    border: "#CA6F1E",
    text: "#CA6F1E",
  },
  {
    phase: 3,
    title: "Conectar",
    desc: "Reemplazar datos mock por API Supabase, formulario de carga",
    bg: "#F4ECF7",
    border: "#7D3C98",
    text: "#7D3C98",
  },
  {
    phase: 4,
    title: "Desligar Excel",
    desc: "Excel solo como exportacion, capacitar supervisores",
    bg: "#FDEDEC",
    border: "#C0392B",
    text: "#C0392B",
  },
];

/* ================================================================== */
/*  TECH CARDS                                                        */
/* ================================================================== */

const TECH_CARDS = [
  {
    name: "PostgreSQL via Supabase",
    desc: "Base de datos relacional, robusto, gratis para empezar",
    icon: Database,
    bg: "#EAF4E8",
    color: "#1E8449",
  },
  {
    name: "Supabase JS Client",
    desc: "Tipado TypeScript nativo para consultas",
    icon: Cpu,
    bg: "#E8F4FD",
    color: "#1A5276",
  },
  {
    name: "Supabase Auth",
    desc: "Roles usuario/supervisor/admin integrados",
    icon: Target,
    bg: "#FDF2E9",
    color: "#CA6F1E",
  },
  {
    name: "Vercel (sin cambio)",
    desc: "Solo se agrega la DB externa al hosting actual",
    icon: Rocket,
    bg: "#F4F4F5",
    color: "#3F3F46",
  },
  {
    name: "Libreria xlsx (npm)",
    desc: "Genera e importa archivos .xlsx",
    icon: Table2,
    bg: "#F4ECF7",
    color: "#7D3C98",
  },
];

/* ================================================================== */
/*  Section wrapper                                                   */
/* ================================================================== */

function SectionHeader({
  stepIndex,
  icon: Icon,
  title,
}: {
  stepIndex: number;
  icon: ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] text-sm font-bold shrink-0">
        {stepIndex + 1}
      </span>
      <Icon size={18} className="text-[#B45309] shrink-0" />
      <h2 className="text-lg font-bold text-[#09090B] tracking-tight">
        {title}
      </h2>
    </div>
  );
}

/* ================================================================== */
/*  EntityDetail Modal — with Escape key support                       */
/* ================================================================== */

function EntityDetailModal({
  entity,
  onClose,
}: {
  entity: EntityInfo;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="Cerrar panel"
      />
      <div className="relative w-[380px] max-w-full">
        <EntityDetail entity={entity} onClose={onClose} />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Accordion Item — para seccion Detalle                             */
/* ================================================================== */

function AccordionEntity({
  entity,
  isOpen,
  onToggle,
}: {
  entity: EntityInfo;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="border rounded-lg overflow-hidden"
      style={{ borderColor: entity.borderColor + "40" }}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#FAFAFA] transition-colors"
      >
        <span
          className="w-1.5 h-8 rounded-full shrink-0"
          style={{ backgroundColor: entity.borderColor }}
        />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-[#09090B]">
            {entity.nombre}
          </span>
          <span className="text-xs text-[#71717A] ml-2">
            {entity.campos.length} campos
          </span>
        </div>
        {isOpen ? (
          <ChevronDown size={16} className="text-[#71717A] shrink-0" />
        ) : (
          <ChevronRight size={16} className="text-[#71717A] shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-[#F4F4F5]">
          <p className="text-xs text-[#3F3F46] mt-3 mb-3">
            {entity.descripcion}
          </p>
          <div className="border border-[#E4E4E7] rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#F4F4F5]">
                  <th className="text-left px-3 py-2 font-semibold text-[#3F3F46]">
                    Campo
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-[#3F3F46]">
                    Tipo
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-[#3F3F46]">
                    Ejemplo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F5]">
                {entity.campos.map((c) => (
                  <tr key={c.name} className="hover:bg-[#FAFAFA]">
                    <td className="px-3 py-1.5 font-medium text-[#09090B]">
                      <span className="flex items-center gap-1.5">
                        {c.name}
                        {c.pk && (
                          <span className="text-[8px] font-bold text-amber-700 bg-amber-50 px-1 rounded">
                            PK
                          </span>
                        )}
                        {c.fk && (
                          <span className="text-[8px] font-bold text-blue-700 bg-blue-50 px-1 rounded">
                            FK
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-[#71717A] font-mono text-[11px]">
                      {c.type}
                    </td>
                    <td className="px-3 py-1.5 text-[#71717A]">
                      {c.ejemplo || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  PAGE COMPONENT                                                    */
/* ================================================================== */

export default function ModeloPage() {
  const [activeStep, setActiveStep] = useState("contexto");
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(
    new Set()
  );

  /* Refs for each section */
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  /* Scroll to section on step click */
  const handleStepClick = useCallback((id: string) => {
    setActiveStep(id);
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  /* IntersectionObserver to update active step on scroll */
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const ids = STEPS.map((s) => s.id);

    ids.forEach((id) => {
      const el = sectionRefs.current[id];
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveStep(id);
            }
          });
        },
        { root: document.getElementById("main-content"), rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  /* ---- JS-based sticky for StepNav (CSS sticky breaks due to overflow-hidden ancestors) ---- */
  const navSentinelRef = useRef<HTMLDivElement>(null);
  const [isNavFixed, setIsNavFixed] = useState(false);

  useEffect(() => {
    const main = document.getElementById("main-content");
    if (!main) return;
    const onScroll = () => {
      if (!navSentinelRef.current) return;
      const sr = navSentinelRef.current.getBoundingClientRect();
      const mr = main.getBoundingClientRect();
      setIsNavFixed(sr.top < mr.top);
    };
    main.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => main.removeEventListener("scroll", onScroll);
  }, []);

  /* Entity lookup for detail panel */
  const selectedEntityInfo = selectedEntity
    ? ENTITIES.find((e) => e.id === selectedEntity) ?? null
    : null;

  /* Accordion toggle */
  const toggleAccordion = useCallback((id: string) => {
    setOpenAccordions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <div>
      {/* Page header */}
      <div className="max-w-[960px] mx-auto flex items-start gap-4 mb-4">
        <Link
          href="/docs"
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#E4E4E7] text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] transition-colors shrink-0 mt-0.5"
          aria-label="Volver a documentacion"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#09090B] tracking-tight">
            Modelo de Base de Datos
          </h1>
          <p className="text-sm text-[#71717A] mt-1">
            9 entidades, sus campos, relaciones y el plan de migracion desde
            datos estaticos hacia PostgreSQL.
          </p>
        </div>
      </div>

      {/* Sentinel: marca la posicion natural del StepNav */}
      <div ref={navSentinelRef} className="h-0" />

      {/* StepNav — JS-based fixed cuando se hace scroll */}
      <div
        className={clsx(
          "z-30 bg-[#F8FAFC] border-b border-[#E4E4E7] py-2",
          isNavFixed
            ? "fixed top-[56px] left-0 lg:left-[240px] right-0 px-4 md:px-6 shadow-sm"
            : "-mx-4 px-4 md:-mx-6 md:px-6"
        )}
      >
        <div className="max-w-[960px] mx-auto">
          <StepNav
            steps={STEPS}
            activeStep={activeStep}
            onStepClick={handleStepClick}
          />
        </div>
      </div>

      {/* Spacer cuando el nav esta fixed para evitar salto de layout */}
      {isNavFixed && <div className="h-12" />}

      <div className="max-w-[960px] mx-auto flex flex-col gap-6 pt-6 pb-16">
      {/* =========================== */}
      {/*  Section 1: Contexto        */}
      {/* =========================== */}
      <section
        ref={(el) => { sectionRefs.current["contexto"] = el; }}
        id="contexto"
        className="scroll-mt-32"
      >
        <SectionHeader stepIndex={0} icon={AlertCircle} title="Contexto y Problema" />

        <div className="rounded-xl border-2 border-[#D97706] bg-[#FFFBEB] p-5">
          <p className="text-sm text-[#92400E] font-semibold mb-3">
            Por que necesitamos una base de datos?
          </p>
          <p className="text-sm text-[#3F3F46] mb-4">
            Actualmente, todos los datos del dashboard estan escritos directamente
            en archivos TypeScript (datos mock). Esto funciona para una demo, pero
            tiene limitaciones reales:
          </p>
          <ul className="space-y-2">
            {[
              "Cambiar un KPI requiere modificar codigo y redesplegar la aplicacion",
              "No hay historial persistente de periodos anteriores",
              "No hay trazabilidad de quien cargo que datos y cuando",
              "La comparacion de periodos depende de datos ficticios",
              "Los datos de analisis de aceite (APD) se pierden al recargar la pagina",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[#3F3F46]">
                <AlertCircle
                  size={14}
                  className="text-[#B45309] shrink-0 mt-0.5"
                />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-[#FDE68A]">
            <p className="text-xs text-[#B45309]">
              La solucion: una base de datos PostgreSQL (via Supabase) que almacene
              los KPIs, alertas, ASARCO y analisis APD de forma permanente, con
              formularios web para la carga de datos.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border-2 border-[#1E8449] bg-[#EAF4E8] p-5">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-[#1E8449] mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-[#186A3B] font-semibold mb-2">
                Estado actual: ya implementado ✓
              </p>
              <p className="text-sm text-[#3F3F46] leading-relaxed mb-3">
                Las 9 entidades de este diagrama ya estan creadas como tablas reales en{" "}
                <strong>Postgres 17.6 sobre Supabase</strong>. El dashboard, /flota, /alertas y
                /portada leen sus datos desde la BD via Drizzle ORM. La carga manual de KPIs
                mensuales se hace desde <Link href="/admin/kpis" className="underline text-[#1E8449]">/admin/kpis</Link>.
              </p>
              <Link
                href="/docs/supabase"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#15803D] hover:text-[#166534]"
              >
                Ver detalle del setup en Supabase →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================== */}
      {/*  Section 2: Las 9 Entidades */}
      {/* =========================== */}
      <section
        ref={(el) => { sectionRefs.current["entidades"] = el; }}
        id="entidades"
        className="scroll-mt-32"
      >
        <SectionHeader stepIndex={1} icon={Table2} title="Las 9 Entidades" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ENTITY_CARDS.map((card) => (
            <button
              key={card.id}
              onClick={() => setSelectedEntity(card.id)}
              className={clsx(
                "text-left rounded-lg border bg-white p-4 transition-all duration-150",
                "hover:shadow-md hover:border-[#D4D4D8]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
                selectedEntity === card.id
                  ? "ring-2 ring-amber-400 shadow-md"
                  : "border-[#E4E4E7]"
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className="w-1 h-full min-h-[48px] rounded-full shrink-0"
                  style={{ backgroundColor: card.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#09090B]">
                      {card.name}
                    </span>
                    {card.tag && (
                      <span className="text-[9px] font-bold text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A] px-1.5 py-0.5 rounded">
                        [{card.tag}]
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#71717A] mt-1 leading-relaxed">
                    {card.desc}
                  </p>
                  <span className="text-[10px] text-[#A1A1AA] mt-2 block">
                    {card.fields} campos
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* EntityDetail panel for card clicks */}
        {selectedEntityInfo && (
          <EntityDetailModal
            entity={selectedEntityInfo}
            onClose={() => setSelectedEntity(null)}
          />
        )}
      </section>

      {/* =========================== */}
      {/*  Section 3: Diagrama ER     */}
      {/* =========================== */}
      <section
        ref={(el) => { sectionRefs.current["er-completo"] = el; }}
        id="er-completo"
        className="scroll-mt-32"
      >
        <SectionHeader
          stepIndex={2}
          icon={GitBranch}
          title="Diagrama ER Completo"
        />

        <div className="relative">
          <InteractiveDiagram
            id="er-completo-diagram"
            nodes={ER_NODES}
            edges={ER_EDGES}
            title="Modelo Entidad-Relacion"
            description="9 entidades del sistema KPI MSG"
            height="700px"
            sections={ER_SECTIONS}
            onNodeClick={(nodeId) => setSelectedEntity(nodeId)}
            selectedNodeId={selectedEntity}
          >
            {selectedEntityInfo && (
              <EntityDetail
                entity={selectedEntityInfo}
                onClose={() => setSelectedEntity(null)}
              />
            )}
          </InteractiveDiagram>
        </div>

        {/* Legend and explanation */}
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#E8F4FD", border: "1px solid #1A5276" }} />
              <span className="text-[#3F3F46]">Azul: Referencia (equipo, tipo)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#EAF4E8", border: "1px solid #1E8449" }} />
              <span className="text-[#3F3F46]">Verde: Configuracion (periodo, umbral)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#FDF2E9", border: "1px solid #CA6F1E" }} />
              <span className="text-[#3F3F46]">Naranja: Operacional (KPI, ASARCO)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#FDEDEC", border: "1px solid #C0392B" }} />
              <span className="text-[#3F3F46]">Rojo: Alertas</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#F4ECF7", border: "1px solid #7D3C98" }} />
              <span className="text-[#3F3F46]">Purpura: APD (aceite)</span>
            </span>
          </div>
          <p className="text-xs text-[#71717A] leading-relaxed">
            Las flechas indican la direccion de la relacion: de la entidad
            &quot;padre&quot; a la &quot;hija&quot;. Una relacion 1:N significa que
            un registro del padre puede tener muchos registros hijos. Por ejemplo,
            un EQUIPO puede tener muchos registros en KPI_EQUIPO (uno por cada mes).
            Haz clic en cualquier entidad para ver sus campos y relaciones.
          </p>
        </div>
      </section>

      {/* =========================== */}
      {/*  Section 4: Nucleo Central  */}
      {/* =========================== */}
      <section
        ref={(el) => { sectionRefs.current["nucleo"] = el; }}
        id="nucleo"
        className="scroll-mt-32"
      >
        <SectionHeader stepIndex={3} icon={Target} title="Nucleo Central" />

        <InteractiveDiagram
          id="nucleo-diagram"
          nodes={NUCLEO_NODES}
          edges={NUCLEO_EDGES}
          title="Nucleo del Sistema"
          description="EQUIPO x PERIODO = KPI_EQUIPO"
          height="480px"
          onNodeClick={(nodeId) => setSelectedEntity(nodeId)}
          selectedNodeId={selectedEntity}
        />

        <div className="mt-4 space-y-4">
          <p className="text-sm text-[#3F3F46] leading-relaxed">
            <strong className="text-[#09090B]">KPI_EQUIPO</strong> es la tabla
            central del sistema. Es la interseccion entre un{" "}
            <strong className="text-[#1A5276]">EQUIPO</strong> y un{" "}
            <strong className="text-[#1E8449]">PERIODO</strong>: contiene los
            indicadores de ese equipo en ese mes especifico.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-3">
              <p className="text-xs font-bold text-[#09090B] mb-1">DFM</p>
              <p className="text-[11px] text-[#3F3F46]">
                Disponibilidad Fisica Mecanica
              </p>
              <p className="text-[10px] text-[#15803D] mt-1 font-medium">
                &ge;85% verde &middot; &ge;75% ambar &middot; &lt;75% rojo
              </p>
            </div>
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-3">
              <p className="text-xs font-bold text-[#09090B] mb-1">TMEF</p>
              <p className="text-[11px] text-[#3F3F46]">
                Tiempo Medio Entre Fallas
              </p>
              <p className="text-[10px] text-[#15803D] mt-1 font-medium">
                &ge;80h verde &middot; &ge;50h ambar &middot; &lt;50h rojo
              </p>
            </div>
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-3">
              <p className="text-xs font-bold text-[#09090B] mb-1">TMPR</p>
              <p className="text-[11px] text-[#3F3F46]">
                Tiempo Medio de Parada por Reparacion
              </p>
              <p className="text-[10px] text-[#15803D] mt-1 font-medium">
                &le;5h verde &middot; &le;15h ambar &middot; &gt;15h rojo
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border-2 border-[#D97706] bg-[#FFFBEB] p-3">
            <AlertCircle size={14} className="text-[#B45309] shrink-0 mt-0.5" />
            <p className="text-xs text-[#92400E] leading-relaxed">
              <strong>Importante:</strong> El semaforo NO se guarda en la base
              de datos. Se calcula en tiempo real comparando el valor del KPI
              contra los umbrales vigentes en la tabla UMBRAL_KPI.
            </p>
          </div>
        </div>
      </section>

      {/* =========================== */}
      {/*  Section 5: Modulo APD      */}
      {/* =========================== */}
      <section
        ref={(el) => { sectionRefs.current["apd"] = el; }}
        id="apd"
        className="scroll-mt-32"
      >
        <SectionHeader stepIndex={4} icon={FlaskConical} title="Modulo APD" />

        <InteractiveDiagram
          id="apd-diagram"
          nodes={APD_NODES}
          edges={APD_EDGES}
          title="Modulo Analisis de Aceite"
          description="ANALISIS_APD contiene MUESTRA_APD"
          height="500px"
          onNodeClick={(nodeId) => setSelectedEntity(nodeId)}
          selectedNodeId={selectedEntity}
        />

        <div className="mt-4 space-y-3">
          <p className="text-sm text-[#3F3F46] leading-relaxed">
            El analisis de aceite (APD) es un proceso de mantenimiento
            predictivo. Un tecnico toma muestras de aceite de los compartimentos
            de cada equipo (motor, transmision, sistema hidraulico) y las envia
            a un laboratorio. Los resultados llegan en formato CSV.
          </p>
          <p className="text-sm text-[#3F3F46] leading-relaxed">
            Actualmente, cuando el tecnico sube el CSV al dashboard, los datos
            se muestran pero <strong className="text-[#C0392B]">se pierden al
            recargar la pagina</strong>. Con la base de datos, cada sesion de
            carga se almacena en{" "}
            <strong className="text-[#7D3C98]">ANALISIS_APD</strong> y cada
            resultado individual en{" "}
            <strong className="text-[#7D3C98]">MUESTRA_APD</strong>.
          </p>

          <div className="rounded-lg border border-[#E4E4E7] bg-white p-4">
            <p className="text-xs font-semibold text-[#09090B] mb-2">
              Ejemplo concreto de una muestra:
            </p>
            <div className="bg-[#F4ECF7] rounded-md px-3 py-2 text-xs text-[#7D3C98] font-mono">
              Viscosidad del motor CE-01: 14.2 cSt, limite 12-16 cSt = verde
            </div>
            <p className="text-[11px] text-[#71717A] mt-2">
              El campo &quot;estado&quot; de MUESTRA_APD se calcula comparando
              el valor contra los limites minimo y maximo.
            </p>
          </div>
        </div>
      </section>

      {/* =========================== */}
      {/*  Section 6: Flujo de Datos  */}
      {/* =========================== */}
      <section
        ref={(el) => { sectionRefs.current["flujo"] = el; }}
        id="flujo"
        className="scroll-mt-32"
      >
        <SectionHeader
          stepIndex={5}
          icon={Workflow}
          title="Flujo de Datos"
        />

        <InteractiveDiagram
          id="flujo-diagram"
          nodes={FLOW_NODES}
          edges={FLOW_EDGES}
          title="Flujo de Carga de Datos"
          description="Dos caminos paralelos: KPIs y APD"
          height="600px"
        />

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-[#E4E4E7] bg-white p-4">
            <p className="text-xs font-bold text-[#1A5276] mb-2">
              Camino 1: Carga de KPIs
            </p>
            <ol className="space-y-1.5 text-xs text-[#3F3F46]">
              <li>1. El supervisor abre el sistema y accede al formulario</li>
              <li>2. Ingresa DFM, TMEF, TMPR y horas ASARCO por equipo</li>
              <li>3. La API valida los datos y los inserta en la BD</li>
              <li>4. Se compara cada KPI contra los umbrales vigentes</li>
              <li>5. Si esta fuera de umbral, se genera una ALERTA automatica</li>
              <li>6. El dashboard se actualiza con los nuevos datos</li>
            </ol>
          </div>
          <div className="rounded-lg border border-[#E4E4E7] bg-white p-4">
            <p className="text-xs font-bold text-[#7D3C98] mb-2">
              Camino 2: Carga de APD
            </p>
            <ol className="space-y-1.5 text-xs text-[#3F3F46]">
              <li>1. El tecnico exporta el CSV del laboratorio</li>
              <li>2. Lo sube al sistema a traves de la vista APD</li>
              <li>3. Se crean registros en ANALISIS_APD y MUESTRA_APD</li>
              <li>4. La vista muestra semaforos por parametro y equipo</li>
              <li>5. Se puede exportar el reporte de resultados</li>
            </ol>
          </div>
        </div>
      </section>

      {/* =========================== */}
      {/*  Section 7: Detalle         */}
      {/* =========================== */}
      <section
        ref={(el) => { sectionRefs.current["detalle"] = el; }}
        id="detalle"
        className="scroll-mt-32"
      >
        <SectionHeader
          stepIndex={6}
          icon={List}
          title="Detalle de Entidades"
        />

        <div className="space-y-2">
          {ENTITIES.map((entity) => (
            <AccordionEntity
              key={entity.id}
              entity={entity}
              isOpen={openAccordions.has(entity.id)}
              onToggle={() => toggleAccordion(entity.id)}
            />
          ))}
        </div>
      </section>

      {/* =========================== */}
      {/*  Section 8: Comparacion     */}
      {/* =========================== */}
      <section
        ref={(el) => { sectionRefs.current["comparacion"] = el; }}
        id="comparacion"
        className="scroll-mt-32"
      >
        <SectionHeader
          stepIndex={7}
          icon={ArrowLeftRight}
          title="Comparacion: Hoy vs. Base de Datos"
        />

        <div className="border border-[#E4E4E7] rounded-xl overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left px-4 py-3 bg-[#F4F4F5] font-semibold text-[#3F3F46] border-b border-[#E4E4E7] w-[20%]">
                  Aspecto
                </th>
                <th className="text-left px-4 py-3 font-semibold border-b border-[#E4E4E7] w-[40%]" style={{ backgroundColor: "#FEF2F2", color: "#B91C1C" }}>
                  Hoy (datos fijos)
                </th>
                <th className="text-left px-4 py-3 font-semibold border-b border-[#E4E4E7] w-[40%]" style={{ backgroundColor: "#F0FDF4", color: "#15803D" }}>
                  Con base de datos
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F5]">
              {COMPARACION_ROWS.map((row, i) => (
                <tr key={i} className="hover:bg-[#FAFAFA]">
                  <td className="px-4 py-2.5 font-medium text-[#09090B] text-xs">
                    {row.aspecto}
                  </td>
                  <td
                    className="px-4 py-2.5 text-xs"
                    style={{ backgroundColor: "#FEF2F2", color: "#991B1B" }}
                  >
                    {row.hoy}
                  </td>
                  <td
                    className="px-4 py-2.5 text-xs"
                    style={{ backgroundColor: "#F0FDF4", color: "#166534" }}
                  >
                    {row.db}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================== */}
      {/*  Section 9: Migracion       */}
      {/* =========================== */}
      <section
        ref={(el) => { sectionRefs.current["migracion"] = el; }}
        id="migracion"
        className="scroll-mt-32"
      >
        <SectionHeader
          stepIndex={8}
          icon={Rocket}
          title="Plan de Migracion"
        />

        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-[#E4E4E7]" />

          <div className="space-y-4">
            {MIGRACION_PHASES.map((phase) => (
              <div key={phase.phase} className="relative flex items-start gap-4">
                {/* Dot on timeline */}
                <span
                  className="absolute -left-6 top-3 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold text-white z-10"
                  style={{ backgroundColor: phase.border }}
                >
                  {phase.phase}
                </span>

                <div
                  className="flex-1 rounded-lg border-2 px-4 py-3"
                  style={{
                    backgroundColor: phase.bg,
                    borderColor: phase.border,
                  }}
                >
                  <p
                    className="text-sm font-bold"
                    style={{ color: phase.text }}
                  >
                    Fase {phase.phase} — {phase.title}
                  </p>
                  <p className="text-xs mt-1" style={{ color: phase.text }}>
                    {phase.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================== */}
      {/*  Section 10: Tecnologia     */}
      {/* =========================== */}
      <section
        ref={(el) => { sectionRefs.current["tecnologia"] = el; }}
        id="tecnologia"
        className="scroll-mt-32"
      >
        <SectionHeader
          stepIndex={9}
          icon={Cpu}
          title="Tecnologia Propuesta"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TECH_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.name}
                className="rounded-lg border border-[#E4E4E7] bg-white p-4 flex items-start gap-3"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: card.bg }}
                >
                  <Icon size={16} style={{ color: card.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#09090B]">
                    {card.name}
                  </p>
                  <p className="text-xs text-[#71717A] mt-0.5 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      </div>
    </div>
  );
}
