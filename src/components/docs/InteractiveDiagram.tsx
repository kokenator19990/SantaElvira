"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ReactFlow,
  MiniMap,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  Panel,
  useReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Maximize2,
  Minimize2,
  Download,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Map as MapIcon,
} from "lucide-react";
import { toPng } from "html-to-image";
import { clsx } from "clsx";

/* ------------------------------------------------------------------ */
/*  Tipos                                                              */
/* ------------------------------------------------------------------ */

export interface DiagramSection {
  id: string;
  label: string;
  nodeIds: string[];
}

interface InteractiveDiagramProps {
  id?: string;
  nodes: Node[];
  edges: Edge[];
  nodeTypes: NodeTypes;
  title: string;
  description?: string;
  height?: string;
  sections?: DiagramSection[];
  onNodeClick?: (nodeId: string) => void;
  selectedNodeId?: string | null;
  children?: ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Botón de toolbar                                                   */
/* ------------------------------------------------------------------ */

function TBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={clsx(
        "flex items-center justify-center w-8 h-8 rounded-md",
        "transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
        active
          ? "bg-[#FFFBEB] text-[#92400E] shadow-sm"
          : "text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5]"
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Botón de sección (zoom a grupo de nodos)                           */
/* ------------------------------------------------------------------ */

function SectionBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap",
        "transition-all duration-150",
        active
          ? "bg-[#92400E] text-white shadow-sm"
          : "text-[#52525B] hover:bg-[#F4F4F5] bg-white/80"
      )}
    >
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Componente interno (dentro de ReactFlowProvider)                    */
/* ------------------------------------------------------------------ */

function DiagramInner({
  nodes,
  edges,
  nodeTypes,
  title,
  description,
  height = "560px",
  sections,
  onNodeClick,
  selectedNodeId,
  children,
}: InteractiveDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showMinimap, setShowMinimap] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  /* Fullscreen listener */
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  /* Highlight selected node */
  const styledNodes = nodes.map((n) => ({
    ...n,
    selected: n.id === selectedNodeId,
  }));

  /* Handlers */
  const handleFitView = useCallback(() => {
    setActiveSection(null);
    fitView({ padding: 0.15, duration: 400 });
  }, [fitView]);

  const handleZoomSection = useCallback(
    (section: DiagramSection) => {
      setActiveSection(section.id);
      const targetNodes = nodes
        .filter((n) => section.nodeIds.includes(n.id))
        .map((n) => ({ id: n.id }));
      if (targetNodes.length) {
        fitView({
          nodes: targetNodes,
          padding: 0.3,
          duration: 500,
        });
      }
    },
    [fitView, nodes]
  );

  const handleExport = useCallback(async () => {
    const viewport = containerRef.current?.querySelector(
      ".react-flow__viewport"
    ) as HTMLElement | null;
    if (!viewport) return;
    try {
      const url = await toPng(viewport, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        filter: (node) => {
          const cl = (node as HTMLElement).className || "";
          if (typeof cl === "string" && cl.includes("react-flow__panel"))
            return false;
          if (typeof cl === "string" && cl.includes("react-flow__minimap"))
            return false;
          return true;
        },
      });
      const a = document.createElement("a");
      a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.png`;
      a.href = url;
      a.click();
    } catch {
      /* ignore export errors */
    }
  }, [title]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* browser may block */
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={clsx(
        "relative rounded-xl border border-[#E4E4E7] bg-white overflow-hidden",
        "transition-all duration-300",
        isFullscreen && "!rounded-none"
      )}
      style={{ height: isFullscreen ? "100vh" : height }}
    >
      <ReactFlow
        nodes={styledNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_e, node) => onNodeClick?.(node.id)}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={3}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        className="!bg-[#FAFBFC]"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#E4E4E7"
        />

        {showMinimap && (
          <MiniMap
            nodeColor={(n) => {
              const d = n.data as Record<string, string>;
              return d?.headerBg || d?.bg || "#E4E4E7";
            }}
            maskColor="rgba(255,255,255,0.7)"
            className="!bg-white !border-[#E4E4E7] !rounded-lg !shadow-md"
            pannable
            zoomable
          />
        )}

        {/* Toolbar */}
        <Panel
          position="top-right"
          className="!m-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-lg border border-[#E4E4E7] px-1.5 py-1 shadow-sm"
        >
          <TBtn onClick={() => zoomIn({ duration: 200 })} title="Acercar">
            <ZoomIn size={15} />
          </TBtn>
          <TBtn onClick={() => zoomOut({ duration: 200 })} title="Alejar">
            <ZoomOut size={15} />
          </TBtn>
          <TBtn onClick={handleFitView} title="Ver todo">
            <Crosshair size={15} />
          </TBtn>

          <div className="w-px h-5 bg-[#E4E4E7] mx-0.5" />

          <TBtn
            onClick={() => setShowMinimap((v) => !v)}
            active={showMinimap}
            title="Minimapa"
          >
            <MapIcon size={15} />
          </TBtn>
          <TBtn
            onClick={toggleFullscreen}
            active={isFullscreen}
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </TBtn>
          <TBtn onClick={handleExport} title="Exportar como PNG">
            <Download size={15} />
          </TBtn>
        </Panel>

        {/* Section zoom buttons */}
        {sections && sections.length > 0 && (
          <Panel
            position="top-left"
            className="!m-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-lg border border-[#E4E4E7] px-2 py-1.5 shadow-sm"
          >
            <SectionBtn
              label="Ver todo"
              active={activeSection === null}
              onClick={handleFitView}
            />
            {sections.map((s) => (
              <SectionBtn
                key={s.id}
                label={s.label}
                active={activeSection === s.id}
                onClick={() => handleZoomSection(s)}
              />
            ))}
          </Panel>
        )}

        {/* Title overlay */}
        <Panel
          position="bottom-left"
          className="!m-3 !mb-4 bg-white/90 backdrop-blur-sm rounded-lg border border-[#E4E4E7] px-3 py-2 shadow-sm max-w-[280px]"
        >
          <div className="text-xs font-bold text-[#09090B] leading-tight">
            {title}
          </div>
          {description && (
            <div className="text-[10px] text-[#71717A] mt-0.5 leading-snug">
              {description}
            </div>
          )}
        </Panel>
      </ReactFlow>

      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Wrapper con Provider                                               */
/* ------------------------------------------------------------------ */

export function InteractiveDiagram(props: InteractiveDiagramProps) {
  return (
    <ReactFlowProvider>
      <DiagramInner {...props} />
    </ReactFlowProvider>
  );
}
