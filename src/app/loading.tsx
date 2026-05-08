/** Skeleton global — se muestra mientras cualquier ruta carga por primera vez. */
export default function GlobalLoading() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-7 w-48 rounded-[8px] bg-[#F4F4F5]" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 rounded-[10px] bg-[#F4F4F5]" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 rounded-[10px] bg-[#F4F4F5]" />
        ))}
      </div>
    </div>
  );
}
