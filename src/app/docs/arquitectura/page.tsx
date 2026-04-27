"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Node, Edge } from "@xyflow/react";
import {
  ArrowLeftRight,
  Layers,
  Upload,
  FlaskConical,
  Users,
  Server,
  Rocket,
  ArrowRightLeft,
  Eye,
  UserCheck,
  Shield,
  Check,
} from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

import {
  InteractiveDiagram,
  type DiagramSection,
} from "@/components/docs/lazy";
import { StepNav, type Step } from "@/components/docs/StepNav";

/* ================================================================== */
/*  Steps (navegacion lateral)                                         */
/* ================================================================== */

const STEPS: Step[] = [
  { id: "hoy-vs-objetivo", label: "Actual vs Objetivo", icon: ArrowLeftRight },
  { id: "capas", label: "Capas del Sistema", icon: Layers },
  { id: "carga-mes", label: "Carga Mensual", icon: Upload },
  { id: "carga-apd", label: "Carga APD", icon: FlaskConical },
  { id: "roles", label: "Roles de Usuario", icon: Users },
  { id: "arquitectura", label: "Arquitectura Tecnica", icon: Server },
  { id: "roadmap", label: "Roadmap", icon: Rocket },
  { id: "reemplazos", label: "Reemplazos", icon: ArrowRightLeft },
];

/* ================================================================== */
/*  Seccion 1 — Situacion Actual vs Objetivo                           */
/* ================================================================== */

const S1_NODES: Node[] = [
  // HOY
  {
    id: "h-excel",
    type: "process",
    position: { x: 0, y: 50 },
    data: {
      label: "Excel KPIs\n(planilla manual)",
      shape: "box",
      bg: "#F1948A",
      borderColor: "#922B21",
    },
  },
  {
    id: "h-csv",
    type: "process",
    position: { x: 0, y: 150 },
    data: {
      label: "CSV APD\n(upload puntual)",
      shape: "box",
      bg: "#F1948A",
      borderColor: "#922B21",
    },
  },
  {
    id: "h-code",
    type: "process",
    position: { x: 200, y: 100 },
    data: {
      label: "Codigo TypeScript\ndatos fijos",
      shape: "box",
      bg: "#FADBD8",
      borderColor: "#922B21",
    },
  },
  {
    id: "h-dash",
    type: "process",
    position: { x: 200, y: 220 },
    data: {
      label: "Dashboard Vercel",
      shape: "box",
      bg: "#E8DAEF",
      borderColor: "#7D3C98",
    },
  },
  // OBJETIVO
  {
    id: "o-excel",
    type: "process",
    position: { x: 500, y: 0 },
    data: {
      label: "Excel KPIs\n(importar)",
      shape: "box",
      bg: "#82E0AA",
      borderColor: "#1E8449",
    },
  },
  {
    id: "o-form",
    type: "process",
    position: { x: 500, y: 100 },
    data: {
      label: "Formulario web\n(carga directa)",
      shape: "box",
      bg: "#82E0AA",
      borderColor: "#1E8449",
    },
  },
  {
    id: "o-csv",
    type: "process",
    position: { x: 500, y: 200 },
    data: {
      label: "CSV APD\n(upload)",
      shape: "box",
      bg: "#82E0AA",
      borderColor: "#1E8449",
    },
  },
  {
    id: "o-api",
    type: "process",
    position: { x: 700, y: 100 },
    data: {
      label: "API Next.js",
      shape: "box",
      bg: "#A9CCE3",
      borderColor: "#1A5276",
    },
  },
  {
    id: "o-db",
    type: "process",
    position: { x: 700, y: 250 },
    data: {
      label: "PostgreSQL / Supabase",
      shape: "cylinder",
      bg: "#FAD7A0",
      borderColor: "#CA6F1E",
    },
  },
  {
    id: "o-dash",
    type: "process",
    position: { x: 900, y: 100 },
    data: {
      label: "Dashboard Vercel",
      shape: "box",
      bg: "#E8DAEF",
      borderColor: "#7D3C98",
    },
  },
  {
    id: "o-export",
    type: "process",
    position: { x: 900, y: 250 },
    data: {
      label: "Exportar Informe",
      shape: "box",
      bg: "#D7BDE2",
      borderColor: "#7D3C98",
    },
  },
];

const S1_EDGES: Edge[] = [
  {
    id: "e-h1",
    source: "h-excel",
    target: "h-code",
    targetHandle: "top-t-1",
    label: "copia manual",
    type: "default",
    style: { stroke: "#922B21" },
  },
  {
    id: "e-h2",
    source: "h-csv",
    target: "h-code",
    targetHandle: "top-t-3",
    label: "se pierde al recargar",
    type: "default",
    style: { stroke: "#922B21" },
  },
  {
    id: "e-h3",
    source: "h-code",
    target: "h-dash",
    type: "default",
    style: { stroke: "#7D3C98" },
  },
  {
    id: "e-o1",
    source: "o-excel",
    target: "o-api",
    targetHandle: "top-t-1",
    label: "importar",
    type: "default",
    style: { stroke: "#1E8449" },
  },
  {
    id: "e-o2",
    source: "o-form",
    target: "o-api",
    type: "default",
    style: { stroke: "#1E8449" },
  },
  {
    id: "e-o3",
    source: "o-csv",
    target: "o-api",
    targetHandle: "top-t-3",
    label: "guardar",
    type: "default",
    style: { stroke: "#1E8449" },
  },
  {
    id: "e-o4",
    source: "o-api",
    target: "o-db",
    type: "default",
    style: { stroke: "#1A5276" },
  },
  {
    id: "e-o5",
    source: "o-db",
    target: "o-dash",
    sourceHandle: "right-s-1",
    targetHandle: "left-t",
    type: "default",
    style: { stroke: "#CA6F1E" },
  },
  {
    id: "e-o6",
    source: "o-db",
    target: "o-export",
    sourceHandle: "right-s",
    targetHandle: "left-t",
    type: "default",
    style: { stroke: "#CA6F1E" },
  },
];

/* ================================================================== */
/*  Seccion 2 — Capas del Sistema                                      */
/* ================================================================== */

const S2_NODES: Node[] = [
  // Grupos (capas)
  {
    id: "g-pres",
    type: "group",
    position: { x: 0, y: 0 },
    data: {
      label: "Presentacion",
      bg: "#EBF5FB",
      borderColor: "#1A5276",
      textColor: "#fff",
      width: 800,
      height: 130,
    },
  },
  {
    id: "g-logic",
    type: "group",
    position: { x: 0, y: 180 },
    data: {
      label: "Logica",
      bg: "#FEF9E7",
      borderColor: "#CA6F1E",
      textColor: "#fff",
      width: 800,
      height: 130,
    },
  },
  {
    id: "g-data",
    type: "group",
    position: { x: 0, y: 360 },
    data: {
      label: "Datos",
      bg: "#EAFAF1",
      borderColor: "#1E8449",
      textColor: "#fff",
      width: 800,
      height: 130,
    },
  },
  // Capa presentacion
  {
    id: "p-portada",
    type: "process",
    position: { x: 30, y: 40 },
    data: { label: "Portada", shape: "box", bg: "#AED6F1", borderColor: "#1A5276" },
  },
  {
    id: "p-dashboard",
    type: "process",
    position: { x: 160, y: 40 },
    data: { label: "Dashboard", shape: "box", bg: "#AED6F1", borderColor: "#1A5276" },
  },
  {
    id: "p-flota",
    type: "process",
    position: { x: 290, y: 40 },
    data: { label: "Flota", shape: "box", bg: "#AED6F1", borderColor: "#1A5276" },
  },
  {
    id: "p-alertas",
    type: "process",
    position: { x: 420, y: 40 },
    data: { label: "Alertas", shape: "box", bg: "#AED6F1", borderColor: "#1A5276" },
  },
  {
    id: "p-apd",
    type: "process",
    position: { x: 550, y: 40 },
    data: { label: "APD", shape: "box", bg: "#AED6F1", borderColor: "#1A5276" },
  },
  {
    id: "p-reporte",
    type: "process",
    position: { x: 680, y: 40 },
    data: { label: "Reporte", shape: "box", bg: "#AED6F1", borderColor: "#1A5276" },
  },
  // Capa logica
  {
    id: "l-semaforos",
    type: "process",
    position: { x: 30, y: 220 },
    data: {
      label: "Calcular\nsemaforos",
      shape: "box",
      bg: "#FAD7A0",
      borderColor: "#CA6F1E",
    },
  },
  {
    id: "l-alertas",
    type: "process",
    position: { x: 190, y: 220 },
    data: {
      label: "Generar\nalertas",
      shape: "box",
      bg: "#FAD7A0",
      borderColor: "#CA6F1E",
    },
  },
  {
    id: "l-comparar",
    type: "process",
    position: { x: 350, y: 220 },
    data: {
      label: "Comparar\nperiodos",
      shape: "box",
      bg: "#FAD7A0",
      borderColor: "#CA6F1E",
    },
  },
  {
    id: "l-csv",
    type: "process",
    position: { x: 510, y: 220 },
    data: {
      label: "Parsear\nCSV APD",
      shape: "box",
      bg: "#FAD7A0",
      borderColor: "#CA6F1E",
    },
  },
  {
    id: "l-export",
    type: "process",
    position: { x: 670, y: 220 },
    data: {
      label: "Exportar\nExcel/PDF",
      shape: "box",
      bg: "#FAD7A0",
      borderColor: "#CA6F1E",
    },
  },
  // Capa datos
  {
    id: "d-equipo",
    type: "process",
    position: { x: 20, y: 400 },
    data: { label: "EQUIPO", shape: "box", bg: "#A9DFBF", borderColor: "#1E8449" },
  },
  {
    id: "d-kpi",
    type: "process",
    position: { x: 130, y: 400 },
    data: {
      label: "KPI_EQUIPO",
      shape: "box",
      bg: "#A9DFBF",
      borderColor: "#1E8449",
    },
  },
  {
    id: "d-asarco",
    type: "process",
    position: { x: 260, y: 400 },
    data: {
      label: "ASARCO_EQUIPO",
      shape: "box",
      bg: "#A9DFBF",
      borderColor: "#1E8449",
    },
  },
  {
    id: "d-alerta",
    type: "process",
    position: { x: 390, y: 400 },
    data: { label: "ALERTA", shape: "box", bg: "#A9DFBF", borderColor: "#1E8449" },
  },
  {
    id: "d-apd",
    type: "process",
    position: { x: 500, y: 400 },
    data: { label: "APD", shape: "box", bg: "#A9DFBF", borderColor: "#1E8449" },
  },
  {
    id: "d-periodo",
    type: "process",
    position: { x: 600, y: 400 },
    data: { label: "PERIODO", shape: "box", bg: "#A9DFBF", borderColor: "#1E8449" },
  },
  {
    id: "d-umbral",
    type: "process",
    position: { x: 710, y: 400 },
    data: {
      label: "UMBRAL_KPI",
      shape: "box",
      bg: "#A9DFBF",
      borderColor: "#1E8449",
    },
  },
];

const S2_EDGES: Edge[] = [
  {
    id: "e-s2-1",
    source: "p-dashboard",
    target: "l-semaforos",
    type: "default",
    style: { stroke: "#1A5276" },
  },
  {
    id: "e-s2-2",
    source: "l-semaforos",
    target: "d-kpi",
    type: "default",
    style: { stroke: "#CA6F1E" },
  },
];

const S2_SECTIONS: DiagramSection[] = [
  {
    id: "pres",
    label: "Presentacion",
    nodeIds: [
      "g-pres",
      "p-portada",
      "p-dashboard",
      "p-flota",
      "p-alertas",
      "p-apd",
      "p-reporte",
    ],
  },
  {
    id: "logic",
    label: "Logica",
    nodeIds: [
      "g-logic",
      "l-semaforos",
      "l-alertas",
      "l-comparar",
      "l-csv",
      "l-export",
    ],
  },
  {
    id: "datos",
    label: "Datos",
    nodeIds: [
      "g-data",
      "d-equipo",
      "d-kpi",
      "d-asarco",
      "d-alerta",
      "d-apd",
      "d-periodo",
      "d-umbral",
    ],
  },
];

/* ================================================================== */
/*  Seccion 3 — Carga Mensual                                         */
/* ================================================================== */

const S3_NODES: Node[] = [
  {
    id: "cm-1",
    type: "process",
    position: { x: 250, y: 0 },
    data: {
      label: "Supervisor abre\nel sistema",
      shape: "oval",
      bg: "#AED6F1",
      borderColor: "#1A5276",
    },
  },
  {
    id: "cm-2",
    type: "process",
    position: { x: 250, y: 100 },
    data: {
      label: "Formulario web\n28 equipos",
      shape: "box",
      bg: "#D5DBDB",
      borderColor: "#555555",
    },
  },
  {
    id: "cm-3",
    type: "process",
    position: { x: 250, y: 200 },
    data: {
      label: "Ingresa KPIs\no importa Excel",
      shape: "box",
      bg: "#FAD7A0",
      borderColor: "#CA6F1E",
    },
  },
  {
    id: "cm-4",
    type: "process",
    position: { x: 250, y: 300 },
    data: {
      label: "API valida\ny procesa",
      shape: "box",
      bg: "#A9CCE3",
      borderColor: "#1A5276",
    },
  },
  {
    id: "cm-5",
    type: "process",
    position: { x: 100, y: 400 },
    data: {
      label: "INSERT\nKPI_EQUIPO",
      shape: "cylinder",
      bg: "#A9DFBF",
      borderColor: "#1E8449",
    },
  },
  {
    id: "cm-6",
    type: "process",
    position: { x: 400, y: 400 },
    data: {
      label: "INSERT\nASARCO_EQUIPO",
      shape: "cylinder",
      bg: "#A9DFBF",
      borderColor: "#1E8449",
    },
  },
  {
    id: "cm-7",
    type: "process",
    position: { x: 250, y: 510 },
    data: {
      label: "Compara vs\nUMBRAL_KPI",
      shape: "diamond",
      bg: "#FDFEFE",
      borderColor: "#555555",
    },
  },
  {
    id: "cm-8",
    type: "process",
    position: { x: 80, y: 620 },
    data: {
      label: "INSERT\nALERTA",
      shape: "cylinder",
      bg: "#FADBD8",
      borderColor: "#C0392B",
    },
  },
  {
    id: "cm-9",
    type: "process",
    position: { x: 420, y: 620 },
    data: {
      label: "Semaforo verde",
      shape: "box",
      bg: "#A9DFBF",
      borderColor: "#1E8449",
    },
  },
  {
    id: "cm-10",
    type: "process",
    position: { x: 250, y: 730 },
    data: {
      label: "Dashboard\nactualizado",
      shape: "box",
      bg: "#E8DAEF",
      borderColor: "#7D3C98",
    },
  },
  {
    id: "cm-11",
    type: "process",
    position: { x: 250, y: 830 },
    data: {
      label: "Supervisor ve:\nN alertas",
      shape: "oval",
      bg: "#AED6F1",
      borderColor: "#1A5276",
    },
  },
];

const S3_EDGES: Edge[] = [
  { id: "e-cm1", source: "cm-1", target: "cm-2", type: "default" },
  { id: "e-cm2", source: "cm-2", target: "cm-3", type: "default" },
  { id: "e-cm3", source: "cm-3", target: "cm-4", type: "default" },
  {
    id: "e-cm4",
    source: "cm-4",
    target: "cm-5",
    type: "default",
    sourceHandle: "left-s",
    targetHandle: "top-t-3",
  },
  {
    id: "e-cm5",
    source: "cm-4",
    target: "cm-6",
    type: "default",
    sourceHandle: "right-s-3",
    targetHandle: "left-t",
  },
  { id: "e-cm6", source: "cm-5", target: "cm-7", targetHandle: "top-t-1", type: "default" },
  { id: "e-cm7", source: "cm-6", target: "cm-7", targetHandle: "top-t-3", type: "default" },
  {
    id: "e-cm8",
    source: "cm-7",
    target: "cm-8",
    sourceHandle: "bottom-s-1",
    label: "KPI fuera de umbral",
    type: "default",
    style: { stroke: "#C0392B" },
  },
  {
    id: "e-cm9",
    source: "cm-7",
    target: "cm-9",
    sourceHandle: "bottom-s-3",
    label: "KPI dentro de umbral",
    type: "default",
    style: { stroke: "#1E8449" },
  },
  { id: "e-cm10", source: "cm-8", target: "cm-10", targetHandle: "top-t-1", type: "default" },
  { id: "e-cm11", source: "cm-9", target: "cm-10", targetHandle: "top-t-3", type: "default" },
  { id: "e-cm12", source: "cm-10", target: "cm-11", type: "default" },
];

/* ================================================================== */
/*  Seccion 4 — Carga APD                                              */
/* ================================================================== */

const S4_NODES: Node[] = [
  {
    id: "apd-1",
    type: "process",
    position: { x: 250, y: 0 },
    data: {
      label: "Tecnico selecciona\nCSV",
      shape: "oval",
      bg: "#D7BDE2",
      borderColor: "#7D3C98",
    },
  },
  {
    id: "apd-2",
    type: "process",
    position: { x: 250, y: 100 },
    data: {
      label: "API valida columnas\ndel CSV",
      shape: "box",
      bg: "#A9CCE3",
      borderColor: "#1A5276",
    },
  },
  {
    id: "apd-err",
    type: "process",
    position: { x: 500, y: 100 },
    data: {
      label: "Error: formato\nincorrecto",
      shape: "box",
      bg: "#FADBD8",
      borderColor: "#C0392B",
    },
  },
  {
    id: "apd-3",
    type: "process",
    position: { x: 250, y: 220 },
    data: {
      label: "CSV valido?",
      shape: "diamond",
      bg: "#FDFEFE",
      borderColor: "#555555",
    },
  },
  {
    id: "apd-4",
    type: "process",
    position: { x: 250, y: 340 },
    data: {
      label: "INSERT\nANALISIS_APD\n(la sesion)",
      shape: "cylinder",
      bg: "#E8DAEF",
      borderColor: "#7D3C98",
    },
  },
  {
    id: "apd-5",
    type: "process",
    position: { x: 250, y: 440 },
    data: {
      label: "INSERT\nMUESTRA_APD\n(N filas)",
      shape: "cylinder",
      bg: "#E8DAEF",
      borderColor: "#7D3C98",
    },
  },
  {
    id: "apd-6",
    type: "process",
    position: { x: 250, y: 540 },
    data: {
      label: "Calcula estado\nverde/ambar/rojo",
      shape: "box",
      bg: "#FAD7A0",
      borderColor: "#CA6F1E",
    },
  },
  {
    id: "apd-7",
    type: "process",
    position: { x: 250, y: 640 },
    data: {
      label: "Vista APD\ncon semaforos",
      shape: "box",
      bg: "#D7BDE2",
      borderColor: "#7D3C98",
    },
  },
  {
    id: "apd-8",
    type: "process",
    position: { x: 250, y: 740 },
    data: {
      label: "Disponible en\nreporte mensual",
      shape: "box",
      bg: "#A9DFBF",
      borderColor: "#1E8449",
    },
  },
];

const S4_EDGES: Edge[] = [
  { id: "e-apd1", source: "apd-1", target: "apd-2", type: "default" },
  {
    id: "e-apd-err",
    source: "apd-2",
    target: "apd-err",
    label: "No valido",
    type: "default",
    sourceHandle: "right-s",
    targetHandle: "left-t",
    style: { stroke: "#C0392B" },
  },
  {
    id: "e-apd2",
    source: "apd-2",
    target: "apd-3",
    label: "Valido",
    type: "default",
    style: { stroke: "#1E8449" },
  },
  { id: "e-apd3", source: "apd-3", target: "apd-4", type: "default" },
  { id: "e-apd4", source: "apd-4", target: "apd-5", type: "default" },
  { id: "e-apd5", source: "apd-5", target: "apd-6", type: "default" },
  { id: "e-apd6", source: "apd-6", target: "apd-7", type: "default" },
  { id: "e-apd7", source: "apd-7", target: "apd-8", type: "default" },
];

/* ================================================================== */
/*  Seccion 6 — Arquitectura Tecnica                                   */
/* ================================================================== */

const S6_NODES: Node[] = [
  // Cliente
  {
    id: "at-browser",
    type: "process",
    position: { x: 200, y: 0 },
    data: {
      label: "Navegador web",
      shape: "box",
      bg: "#AED6F1",
      borderColor: "#1A5276",
    },
  },
  {
    id: "at-mobile",
    type: "process",
    position: { x: 450, y: 0 },
    data: {
      label: "Celular\n(responsive)",
      shape: "box",
      bg: "#AED6F1",
      borderColor: "#1A5276",
    },
  },
  // Vercel
  {
    id: "at-next",
    type: "process",
    position: { x: 200, y: 150 },
    data: {
      label: "Next.js 14\nApp Router",
      shape: "box",
      bg: "#D7BDE2",
      borderColor: "#7D3C98",
    },
  },
  {
    id: "at-api",
    type: "process",
    position: { x: 200, y: 250 },
    data: {
      label: "API Routes\n/api/kpis /api/alertas /api/apd",
      shape: "box",
      bg: "#E8DAEF",
      borderColor: "#7D3C98",
    },
  },
  {
    id: "at-react",
    type: "process",
    position: { x: 500, y: 200 },
    data: {
      label: "React + Tailwind\n+ Recharts",
      shape: "box",
      bg: "#E8DAEF",
      borderColor: "#7D3C98",
    },
  },
  // Supabase
  {
    id: "at-pg",
    type: "process",
    position: { x: 200, y: 400 },
    data: {
      label: "PostgreSQL\n9 tablas",
      shape: "cylinder",
      bg: "#A9DFBF",
      borderColor: "#1E8449",
    },
  },
  {
    id: "at-auth",
    type: "process",
    position: { x: 400, y: 400 },
    data: {
      label: "Auth / Roles",
      shape: "box",
      bg: "#A9DFBF",
      borderColor: "#1E8449",
    },
  },
  {
    id: "at-realtime",
    type: "process",
    position: { x: 600, y: 400 },
    data: {
      label: "Realtime\nalertas en vivo",
      shape: "box",
      bg: "#A9DFBF",
      borderColor: "#1E8449",
    },
  },
  // Externo
  {
    id: "at-excel",
    type: "process",
    position: { x: 100, y: 550 },
    data: {
      label: "Excel mensual\nKPIs",
      shape: "box",
      bg: "#FAD7A0",
      borderColor: "#CA6F1E",
    },
  },
  {
    id: "at-csv",
    type: "process",
    position: { x: 400, y: 550 },
    data: {
      label: "CSV APD\naceites",
      shape: "box",
      bg: "#FAD7A0",
      borderColor: "#CA6F1E",
    },
  },
];

const S6_EDGES: Edge[] = [
  {
    id: "e-at1",
    source: "at-browser",
    target: "at-next",
    targetHandle: "top-t-1",
    label: "HTTPS",
    type: "default",
    style: { stroke: "#1A5276" },
  },
  {
    id: "e-at2",
    source: "at-mobile",
    target: "at-next",
    targetHandle: "top-t-3",
    type: "default",
    style: { stroke: "#1A5276" },
  },
  {
    id: "e-at3",
    source: "at-next",
    target: "at-api",
    sourceHandle: "bottom-s-1",
    type: "default",
    style: { stroke: "#7D3C98" },
  },
  {
    id: "e-at4",
    source: "at-next",
    target: "at-react",
    sourceHandle: "bottom-s-3",
    type: "default",
    style: { stroke: "#7D3C98" },
  },
  {
    id: "e-at5",
    source: "at-api",
    target: "at-pg",
    sourceHandle: "bottom-s-1",
    label: "SQL",
    type: "default",
    style: { stroke: "#1E8449" },
  },
  {
    id: "e-at6",
    source: "at-api",
    target: "at-auth",
    sourceHandle: "bottom-s-3",
    label: "verifica roles",
    type: "default",
    style: { stroke: "#1E8449" },
  },
  {
    id: "e-at7",
    source: "at-pg",
    target: "at-realtime",
    label: "cambios en tiempo real",
    type: "default",
    sourceHandle: "right-s",
    targetHandle: "left-t",
    style: { stroke: "#1E8449" },
  },
  {
    id: "e-at8",
    source: "at-realtime",
    target: "at-browser",
    label: "WebSocket",
    type: "default",
    style: { stroke: "#1A5276" },
  },
  {
    id: "e-at9",
    source: "at-excel",
    target: "at-api",
    targetHandle: "top-t-1",
    label: "import",
    type: "default",
    style: { stroke: "#CA6F1E" },
  },
  {
    id: "e-at10",
    source: "at-csv",
    target: "at-api",
    targetHandle: "top-t-3",
    label: "upload",
    type: "default",
    style: { stroke: "#CA6F1E" },
  },
];

const S6_SECTIONS: DiagramSection[] = [
  { id: "frontend", label: "Frontend", nodeIds: ["at-browser", "at-mobile"] },
  {
    id: "backend",
    label: "Backend",
    nodeIds: ["at-next", "at-api", "at-react"],
  },
  {
    id: "db",
    label: "Base de datos",
    nodeIds: ["at-pg", "at-auth", "at-realtime"],
  },
  { id: "entradas", label: "Entradas", nodeIds: ["at-excel", "at-csv"] },
];

/* ================================================================== */
/*  Seccion 5 — Roles (datos estaticos)                                */
/* ================================================================== */

interface RoleDef {
  name: string;
  description: string;
  accent: string;
  accentBg: string;
  icon: typeof Eye;
  permissions: string[];
}

const ROLES: RoleDef[] = [
  {
    name: "Operario",
    description: "Solo lectura. Acceso a dashboards y alertas vigentes.",
    accent: "#1A5276",
    accentBg: "#EBF5FB",
    icon: Eye,
    permissions: [
      "Ver dashboard",
      "Ver alertas activas",
      "Ver estado de flota",
    ],
  },
  {
    name: "Supervisor",
    description: "Lectura y carga de datos operativos mensuales.",
    accent: "#1E8449",
    accentBg: "#EAFAF1",
    icon: UserCheck,
    permissions: [
      "Todo lo del operario",
      "Cargar KPIs del mes",
      "Subir CSV APD",
      "Generar reporte mensual",
    ],
  },
  {
    name: "Administrador",
    description: "Acceso total. Configuracion, gestion de usuarios y exportacion.",
    accent: "#CA6F1E",
    accentBg: "#FEF9E7",
    icon: Shield,
    permissions: [
      "Todo lo del supervisor",
      "Configurar umbrales KPI",
      "Gestionar equipos",
      "Exportar historial completo",
      "Gestionar usuarios",
    ],
  },
];

/* ================================================================== */
/*  Seccion 7 — Roadmap (datos estaticos)                              */
/* ================================================================== */

interface RoadmapPoint {
  tag: string;
  title: string;
  color: string;
  bg: string;
  shape: "oval" | "card";
}

const ROADMAP: RoadmapPoint[] = [
  {
    tag: "HOY",
    title: "ESTADO ACTUAL: datos fijos en codigo",
    color: "#C0392B",
    bg: "#FADBD8",
    shape: "oval",
  },
  {
    tag: "FASE 0",
    title: "Validar modelo con el equipo, mapear Excels existentes",
    color: "#1E8449",
    bg: "#EAFAF1",
    shape: "card",
  },
  {
    tag: "FASE 1",
    title: "Crear proyecto Supabase, ejecutar SQL (crear tablas)",
    color: "#1A5276",
    bg: "#EBF5FB",
    shape: "card",
  },
  {
    tag: "FASE 2",
    title: "Importar 6 meses de KPIs historicos, validar semaforos",
    color: "#CA6F1E",
    bg: "#FEF9E7",
    shape: "card",
  },
  {
    tag: "FASE 3",
    title: "Conectar dashboard a Supabase, formulario carga KPIs mensuales",
    color: "#7D3C98",
    bg: "#F4ECF7",
    shape: "card",
  },
  {
    tag: "FASE 4",
    title: "Excel solo como exportacion, capacitar supervisores",
    color: "#C0392B",
    bg: "#FADBD8",
    shape: "card",
  },
  {
    tag: "OBJETIVO",
    title: "OBJETIVO: datos en base de datos real",
    color: "#1E8449",
    bg: "#EAFAF1",
    shape: "oval",
  },
];

/* ================================================================== */
/*  Seccion 8 — Reemplazos (datos estaticos)                           */
/* ================================================================== */

interface ReplacementRow {
  from: string;
  to: string;
  label: string;
}

const REPLACEMENTS: ReplacementRow[] = [
  {
    from: "Excel mensual KPIs",
    to: "KPI_EQUIPO",
    label: "importa y reemplaza",
  },
  {
    from: "Excel ASARCO",
    to: "ASARCO_EQUIPO",
    label: "importa y reemplaza",
  },
  {
    from: "CSV APD (temporal)",
    to: "ANALISIS_APD + MUESTRA_APD",
    label: "guarda permanente",
  },
  {
    from: "Calculo manual del supervisor",
    to: "ALERTA (automatizado)",
    label: "automatizado",
  },
  {
    from: "Constantes en codigo",
    to: "UMBRAL_KPI (configurable)",
    label: "configurable",
  },
];

/* ================================================================== */
/*  SectionHeader                                                      */
/* ================================================================== */

function SectionHeader({
  number,
  title,
  icon: Icon,
}: {
  number: number;
  title: string;
  icon: typeof ArrowLeftRight;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
        style={{ backgroundColor: "#FFFBEB" }}
      >
        <span className="text-xs font-bold" style={{ color: "#B45309" }}>
          {number}
        </span>
      </div>
      <Icon size={18} style={{ color: "#3F3F46" }} className="shrink-0" />
      <h2
        className="text-lg font-bold tracking-tight"
        style={{ color: "#09090B" }}
      >
        {title}
      </h2>
    </div>
  );
}

/* ================================================================== */
/*  ExplanationBox                                                     */
/* ================================================================== */

function ExplanationBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mt-4 rounded-xl px-5 py-4 text-sm leading-relaxed"
      style={{
        backgroundColor: "#F4F4F5",
        color: "#3F3F46",
      }}
    >
      {children}
    </div>
  );
}

/* ================================================================== */
/*  Pagina principal                                                   */
/* ================================================================== */

export default function ArquitecturaPage() {
  const [activeStep, setActiveStep] = useState("hoy-vs-objetivo");

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const setRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      sectionRefs.current[id] = el;
    },
    []
  );

  /* Scroll suave al hacer clic en un step */
  const handleStepClick = useCallback((id: string) => {
    setActiveStep(id);
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  /* IntersectionObserver: actualiza activeStep al hacer scroll */
  useEffect(() => {
    const ids = STEPS.map((s) => s.id);
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = sectionRefs.current[id];
      if (!el) return;

      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveStep(id);
            }
          });
        },
        { root: document.getElementById("main-content"), rootMargin: "-20% 0px -60% 0px", threshold: 0 }
      );

      obs.observe(el);
      observers.push(obs);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
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

  return (
    <div>
      {/* Page header */}
      <div className="max-w-[960px] mx-auto flex items-start gap-4 mb-4">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
          style={{
            backgroundColor: "#EBF5FB",
            border: "1px solid #AED6F1",
          }}
        >
          <Layers size={18} style={{ color: "#1A5276" }} />
        </div>
        <div>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: "#09090B" }}
          >
            Arquitectura del Sistema
          </h1>
          <p
            className="text-sm mt-1 max-w-lg leading-relaxed"
            style={{ color: "#71717A" }}
          >
            Desde el estado actual hasta el objetivo con base de datos real.
            Capas, flujos de carga, roles y roadmap de migracion.
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

      <div className="max-w-[960px] mx-auto flex flex-col gap-6 pt-6">
      {/* ============================================================ */}
      {/*  Seccion 1 — Situacion Actual vs Objetivo                     */}
      {/* ============================================================ */}
      <section
        ref={setRef("hoy-vs-objetivo")}
        id="hoy-vs-objetivo"
        className="scroll-mt-28"
      >
        <SectionHeader
          number={1}
          title="Situacion Actual vs Objetivo"
          icon={ArrowLeftRight}
        />
        <InteractiveDiagram
          id="s1-hoy-vs-obj"
          nodes={S1_NODES}
          edges={S1_EDGES}
          title="Hoy vs Objetivo"
          description="Comparacion del flujo actual con el estado objetivo"
          height="520px"
        />
        <ExplanationBox>
          El sistema hoy tiene toda la logica correcta, pero los datos estan
          escritos fijos en el codigo. El objetivo es conectarlo a una base de
          datos real para que los supervisores puedan cargar y consultar datos
          sin modificar el codigo fuente.
        </ExplanationBox>

        <div
          className="mt-4 rounded-xl border-2 p-5"
          style={{ borderColor: "#1E8449", backgroundColor: "#EAF4E8" }}
        >
          <div className="flex items-start gap-3">
            <Check size={20} style={{ color: "#1E8449" }} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold mb-2" style={{ color: "#186A3B" }}>
                Estado actual: el OBJETIVO ya esta implementado ✓
              </p>
              <p className="text-sm leading-relaxed mb-3" style={{ color: "#3F3F46" }}>
                La caja verde &ldquo;OBJETIVO — Con base de datos&rdquo; del diagrama de arriba ya es la
                realidad. Existe el proyecto Supabase, las 9 tablas Postgres, las migraciones
                Drizzle, los formularios web en /admin y la persistencia del CSV APD.
              </p>
              <Link
                href="/docs/supabase"
                className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                style={{ color: "#15803D" }}
              >
                Ver el setup completo de Supabase →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Seccion 2 — Capas del Sistema                                */}
      {/* ============================================================ */}
      <section ref={setRef("capas")} id="capas" className="scroll-mt-28">
        <SectionHeader number={2} title="Capas del Sistema" icon={Layers} />
        <InteractiveDiagram
          id="s2-capas"
          nodes={S2_NODES}
          edges={S2_EDGES}
          title="Capas del Sistema"
          description="Presentacion, Logica y Datos separados por responsabilidad"
          height="600px"
          sections={S2_SECTIONS}
        />
        <ExplanationBox>
          Cada capa tiene una responsabilidad clara.{" "}
          <strong style={{ color: "#09090B" }}>Presentacion</strong> muestra las
          pantallas al usuario.{" "}
          <strong style={{ color: "#09090B" }}>Logica</strong> contiene las
          reglas de negocio (semaforos, alertas, comparaciones).{" "}
          <strong style={{ color: "#09090B" }}>Datos</strong> define las tablas
          donde se persiste toda la informacion.
        </ExplanationBox>
      </section>

      {/* ============================================================ */}
      {/*  Seccion 3 — Carga Mensual                                    */}
      {/* ============================================================ */}
      <section
        ref={setRef("carga-mes")}
        id="carga-mes"
        className="scroll-mt-28"
      >
        <SectionHeader number={3} title="Carga Mensual" icon={Upload} />
        <InteractiveDiagram
          id="s3-carga-mes"
          nodes={S3_NODES}
          edges={S3_EDGES}
          title="Flujo de Carga Mensual"
          description="Desde que el supervisor abre el sistema hasta que el dashboard se actualiza"
          height="820px"
        />
        <ExplanationBox>
          Paso a paso de como el supervisor carga los datos mensuales: ingresa
          KPIs por equipo (o importa desde Excel), el sistema valida contra los
          umbrales configurados, genera alertas automaticas cuando un KPI esta
          fuera de rango y actualiza el dashboard en tiempo real.
        </ExplanationBox>
      </section>

      {/* ============================================================ */}
      {/*  Seccion 4 — Carga APD                                        */}
      {/* ============================================================ */}
      <section
        ref={setRef("carga-apd")}
        id="carga-apd"
        className="scroll-mt-28"
      >
        <SectionHeader number={4} title="Carga APD" icon={FlaskConical} />
        <InteractiveDiagram
          id="s4-carga-apd"
          nodes={S4_NODES}
          edges={S4_EDGES}
          title="Flujo de Carga APD"
          description="Desde la seleccion del CSV hasta el almacenamiento permanente"
          height="720px"
        />
        <ExplanationBox>
          El flujo de carga de analisis de aceites (APD): el tecnico selecciona
          un archivo CSV, el sistema valida las columnas esperadas, inserta la
          sesion y cada muestra en la base de datos, calcula el estado
          (verde/ambar/rojo) por parametro, y deja los resultados disponibles
          tanto en la vista APD como en el reporte mensual.
        </ExplanationBox>
      </section>

      {/* ============================================================ */}
      {/*  Seccion 5 — Roles de Usuario                                 */}
      {/* ============================================================ */}
      <section ref={setRef("roles")} id="roles" className="scroll-mt-28">
        <SectionHeader number={5} title="Roles de Usuario" icon={Users} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROLES.map((role) => {
            const RoleIcon = role.icon;
            return (
              <div
                key={role.name}
                className="rounded-xl overflow-hidden"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E4E4E7",
                }}
              >
                {/* Top accent bar */}
                <div
                  className="h-1.5"
                  style={{ backgroundColor: role.accent }}
                />

                <div className="p-5 flex flex-col gap-3">
                  {/* Icon + name */}
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-lg"
                      style={{ backgroundColor: role.accentBg }}
                    >
                      <RoleIcon
                        size={16}
                        style={{ color: role.accent }}
                      />
                    </div>
                    <div>
                      <h3
                        className="text-sm font-bold"
                        style={{ color: "#09090B" }}
                      >
                        {role.name}
                      </h3>
                      <p
                        className="text-[11px] leading-snug mt-0.5"
                        style={{ color: "#71717A" }}
                      >
                        {role.description}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    className="h-px"
                    style={{ backgroundColor: "#E4E4E7" }}
                  />

                  {/* Permissions */}
                  <ul className="flex flex-col gap-1.5">
                    {role.permissions.map((perm) => (
                      <li
                        key={perm}
                        className="flex items-start gap-2 text-xs"
                        style={{ color: "#3F3F46" }}
                      >
                        <Check
                          size={13}
                          className="shrink-0 mt-0.5"
                          style={{ color: role.accent }}
                        />
                        <span>{perm}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <ExplanationBox>
          Los tres roles del sistema con divulgacion progresiva de permisos.
          Cada nivel incluye todos los permisos del nivel anterior mas los
          propios. El operario solo consulta, el supervisor carga datos
          mensuales, y el administrador configura el sistema completo.
        </ExplanationBox>
      </section>

      {/* ============================================================ */}
      {/*  Seccion 6 — Arquitectura Tecnica                             */}
      {/* ============================================================ */}
      <section
        ref={setRef("arquitectura")}
        id="arquitectura"
        className="scroll-mt-28"
      >
        <SectionHeader
          number={6}
          title="Arquitectura Tecnica"
          icon={Server}
        />
        <InteractiveDiagram
          id="s6-arq-tecnica"
          nodes={S6_NODES}
          edges={S6_EDGES}
          title="Stack Tecnico"
          description="Next.js 14 + Supabase + Vercel"
          height="600px"
          sections={S6_SECTIONS}
        />
        <ExplanationBox>
          El stack tecnico completo: el navegador y celular se conectan via
          HTTPS a Next.js 14 desplegado en Vercel. Las API routes manejan la
          logica de negocio y se comunican con PostgreSQL en Supabase via SQL.
          Supabase Auth gestiona roles, y Realtime permite notificaciones de
          alertas en vivo via WebSocket. Los datos de entrada (Excel mensual y
          CSV APD) se importan a traves de las API routes.
        </ExplanationBox>
      </section>

      {/* ============================================================ */}
      {/*  Seccion 7 — Roadmap                                          */}
      {/* ============================================================ */}
      <section ref={setRef("roadmap")} id="roadmap" className="scroll-mt-28">
        <SectionHeader number={7} title="Roadmap" icon={Rocket} />

        <div className="relative flex flex-col items-center gap-0 py-4">
          {/* Linea vertical central */}
          <div
            className="absolute left-1/2 top-8 bottom-8 w-px -translate-x-1/2"
            style={{ backgroundColor: "#E4E4E7" }}
          />

          {ROADMAP.map((point, i) => {
            const isOval = point.shape === "oval";
            return (
              <div
                key={point.tag}
                className="relative flex items-center w-full max-w-md"
                style={{ marginTop: i === 0 ? 0 : 8 }}
              >
                {/* Dot */}
                <div className="absolute left-1/2 -translate-x-1/2 z-10">
                  <div
                    className="w-4 h-4 rounded-full border-2"
                    style={{
                      borderColor: point.color,
                      backgroundColor: point.bg,
                    }}
                  />
                </div>

                {/* Card */}
                <div
                  className={clsx(
                    "w-full py-3 px-4",
                    isOval
                      ? "rounded-full text-center"
                      : "rounded-xl text-left"
                  )}
                  style={{
                    backgroundColor: point.bg,
                    border: `2px solid ${point.color}`,
                  }}
                >
                  <div className="flex items-center gap-2 justify-center flex-wrap">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: point.color,
                        color: "#FFFFFF",
                      }}
                    >
                      {point.tag}
                    </span>
                    <span
                      className="text-xs font-medium leading-tight"
                      style={{ color: "#09090B" }}
                    >
                      {point.title}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <ExplanationBox>
          El plan de migracion en 5 fases, desde el estado actual con datos
          fijos en codigo hasta el objetivo final con base de datos real. Cada
          fase es incremental y permite validar antes de avanzar a la
          siguiente.
        </ExplanationBox>
      </section>

      {/* ============================================================ */}
      {/*  Seccion 8 — Reemplazos                                       */}
      {/* ============================================================ */}
      <section
        ref={setRef("reemplazos")}
        id="reemplazos"
        className="scroll-mt-28"
      >
        <SectionHeader
          number={8}
          title="Reemplazos"
          icon={ArrowRightLeft}
        />

        <div className="flex flex-col gap-3">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center px-2">
            <div
              className="text-xs font-bold uppercase tracking-wider text-center"
              style={{ color: "#922B21" }}
            >
              Hoy
            </div>
            <div className="w-10" />
            <div
              className="text-xs font-bold uppercase tracking-wider text-center"
              style={{ color: "#1E8449" }}
            >
              Objetivo
            </div>
          </div>

          {/* Rows */}
          {REPLACEMENTS.map((row) => (
            <div
              key={row.from}
              className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center"
            >
              {/* FROM */}
              <div
                className="rounded-lg px-4 py-3 text-xs font-medium text-center"
                style={{
                  backgroundColor: "#FADBD8",
                  border: "1px solid #E6B0AA",
                  color: "#922B21",
                }}
              >
                {row.from}
              </div>

              {/* Arrow + label */}
              <div className="flex flex-col items-center gap-1 w-28 shrink-0">
                <ArrowRightLeft
                  size={14}
                  style={{ color: "#71717A" }}
                />
                <span
                  className="text-[10px] font-medium text-center leading-tight"
                  style={{ color: "#71717A" }}
                >
                  {row.label}
                </span>
              </div>

              {/* TO */}
              <div
                className="rounded-lg px-4 py-3 text-xs font-medium text-center"
                style={{
                  backgroundColor: "#EAFAF1",
                  border: "1px solid #A9DFBF",
                  color: "#1E8449",
                }}
              >
                {row.to}
              </div>
            </div>
          ))}
        </div>

        <ExplanationBox>
          Mapeo claro de cada fuente de datos actual hacia su reemplazo en base
          de datos. El Excel mensual se importa a KPI_EQUIPO y ASARCO_EQUIPO,
          el CSV APD se guarda permanentemente, el calculo manual se
          automatiza, y las constantes en codigo se convierten en umbrales
          configurables desde la interfaz.
        </ExplanationBox>
      </section>

      {/* Bottom spacer */}
      <div className="h-8" />
      </div>
    </div>
  );
}
