"use client";

import dynamic from "next/dynamic";

function ReporteSkeleton({ className = "h-72" }: { className?: string }) {
  return (
    <div
      className={`${className} rounded-[10px] bg-white border border-[#E4E4E7] animate-pulse`}
      aria-hidden="true"
    />
  );
}

export const GraficosReporte = dynamic(
  () => import("./GraficosReporte").then((m) => ({ default: m.GraficosReporte })),
  { ssr: false, loading: () => <ReporteSkeleton className="h-96" /> }
);

export const ComparacionPeriodos = dynamic(
  () => import("./ComparacionPeriodos").then((m) => ({ default: m.ComparacionPeriodos })),
  { ssr: false, loading: () => <ReporteSkeleton className="h-96" /> }
);
