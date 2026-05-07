"use client";

import dynamic from "next/dynamic";

function ChartSkeleton({ className = "h-52" }: { className?: string }) {
  return (
    <div
      className={`${className} rounded-[10px] bg-white border border-[#E4E4E7] animate-pulse`}
      aria-hidden="true"
    />
  );
}

export const TendenciaSeisMeses = dynamic(
  () => import("./TendenciaSeisMeses").then((m) => ({ default: m.TendenciaSeisMeses })),
  { ssr: false, loading: () => <ChartSkeleton className="h-64" /> }
);

export const AsarcoTimeChart = dynamic(
  () => import("./AsarcoTimeChart").then((m) => ({ default: m.AsarcoTimeChart })),
  { ssr: false, loading: () => <ChartSkeleton className="h-64" /> }
);

export const DisponibilidadBar = dynamic(
  () => import("./DisponibilidadBar").then((m) => ({ default: m.DisponibilidadBar })),
  { ssr: false, loading: () => <ChartSkeleton className="h-48" /> }
);

export const TendenciaFlotaSelector = dynamic(
  () => import("./TendenciaFlotaSelector").then((m) => ({ default: m.TendenciaFlotaSelector })),
  { ssr: false, loading: () => <ChartSkeleton className="h-72" /> }
);
