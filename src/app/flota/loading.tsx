/** Skeleton de la vista flota. */
export default function FlotaLoading() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 rounded-[8px] bg-[#F4F4F5]" />
        <div className="h-8 w-28 rounded-[8px] bg-[#F4F4F5]" />
      </div>
      {/* Filtros */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-[6px] bg-[#F4F4F5]" />
        ))}
      </div>
      {/* Tabla/grid de equipos */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 rounded-[10px] bg-white border border-[#E4E4E7]" />
        ))}
      </div>
    </div>
  );
}
