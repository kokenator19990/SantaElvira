"use client";

import dynamic from "next/dynamic";
import type { ComponentType, ReactNode } from "react";
import type { Node, Edge } from "@xyflow/react";

export type { DiagramSection } from "./InteractiveDiagram";

interface LazyDiagramProps {
  id?: string;
  nodes: Node[];
  edges: Edge[];
  title: string;
  description?: string;
  height?: string;
  sections?: import("./InteractiveDiagram").DiagramSection[];
  onNodeClick?: (nodeId: string) => void;
  selectedNodeId?: string | null;
  children?: ReactNode;
}

const DiagramSkeleton = () => (
  <div
    className="rounded-xl bg-white border border-[#E4E4E7] animate-pulse"
    style={{ height: 560 }}
    aria-hidden="true"
  />
);

export const InteractiveDiagram = dynamic<LazyDiagramProps>(
  async () => {
    const [{ InteractiveDiagram }, { DIAGRAM_NODE_TYPES }] = await Promise.all([
      import("./InteractiveDiagram"),
      import("./diagram-nodes"),
    ]);
    const Wrapped: ComponentType<LazyDiagramProps> = (props) => (
      <InteractiveDiagram {...props} nodeTypes={DIAGRAM_NODE_TYPES} />
    );
    return { default: Wrapped };
  },
  { ssr: false, loading: DiagramSkeleton }
);
