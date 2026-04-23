import { clsx } from "clsx";

type SkeletonVariant = "kpi" | "chart" | "table";

const ALTURAS: Record<SkeletonVariant, string> = {
  kpi:   "h-28",
  chart: "h-56",
  table: "h-40",
};

export function SkeletonCard({
  variant = "kpi",
  className,
}: {
  variant?: SkeletonVariant;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-xl bg-[#F4F4F5] border border-[#E4E4E7]",
        ALTURAS[variant],
        className
      )}
    />
  );
}
