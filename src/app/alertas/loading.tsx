/** Skeleton del panel de alertas. */
export default function AlertasLoading() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-44 rounded-[8px] bg-[#F4F4F5]" />
        <div className="h-8 w-36 rounded-[8px] bg-[#F4F4F5]" />
      </div>
      {/* Tabs */}
      <div className="flex gap-2">
        <div className="h-9 w-28 rounded-[8px] bg-[#F4F4F5]" />
        <div className="h-9 w-28 rounded-[8px] bg-[#F4F4F5]" />
      </div>
      {/* Filas de alerta */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-[10px] bg-white border border-[#E4E4E7]">
          <div className="w-3 h-3 rounded-full bg-[#F4F4F5] shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-3 w-24 rounded bg-[#F4F4F5]" />
            <div className="h-2.5 w-48 rounded bg-[#F4F4F5]" />
          </div>
          <div className="h-6 w-16 rounded bg-[#F4F4F5]" />
        </div>
      ))}
    </div>
  );
}
