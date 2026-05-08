/** Skeleton del dashboard — replica el layout real para evitar CLS. */
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      {/* Título + selector de período */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-52 rounded-[8px] bg-[#F4F4F5]" />
        <div className="h-8 w-32 rounded-[8px] bg-[#F4F4F5]" />
      </div>

      {/* KPI Strip — 5 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 p-4 rounded-[10px] bg-white border border-[#E4E4E7]">
            <div className="h-3 w-16 rounded bg-[#F4F4F5]" />
            <div className="h-9 w-20 rounded bg-[#F4F4F5]" />
            <div className="h-[3px] w-full rounded-full bg-[#F4F4F5]" />
          </div>
        ))}
      </div>

      {/* Semáforo flota — 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 rounded-[10px] bg-white border border-[#E4E4E7] border-l-[3px] border-l-[#E4E4E7]" />
        ))}
      </div>

      {/* Alertas + Tendencia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-64 rounded-[10px] bg-white border border-[#E4E4E7]" />
        <div className="h-64 rounded-[10px] bg-white border border-[#E4E4E7]" />
      </div>
    </div>
  );
}
