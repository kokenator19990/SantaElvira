import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <span className="text-[64px] font-mono font-bold text-[#E4E4E7] leading-none">404</span>
      <p className="text-[16px] font-semibold text-[#52525B]">Página no encontrada</p>
      <p className="text-[13px] text-[#A1A1AA] text-center max-w-sm">
        La ruta que intentas acceder no existe. Verifica la URL o vuelve al dashboard.
      </p>
      <Link
        href="/dashboard"
        className="mt-2 px-4 py-2 rounded-[7px] bg-[#09090B] hover:bg-[#27272A] text-white text-[13px] font-semibold transition-colors"
      >
        Ir al Dashboard
      </Link>
    </div>
  );
}
