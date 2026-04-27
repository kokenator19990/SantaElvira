import { clsx } from "clsx";

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}

export function SectionTitle({ children, className, accent = true }: SectionTitleProps) {
  return (
    <div className={clsx("flex items-center gap-3", className)}>
      {accent && (
        <div className="h-3.5 w-[3px] rounded-full bg-[#B45309] shrink-0" aria-hidden="true" />
      )}
      <h2 className="text-[12px] font-bold text-[#09090B] uppercase tracking-[0.12em]">
        {children}
      </h2>
    </div>
  );
}
