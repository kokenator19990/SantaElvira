"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { useHelpMode } from "@/contexts/HelpModeContext";
import { WifiOff } from "lucide-react";

export function ShellClient({
  children,
  alertasCriticas,
  totalEquipos,
}: {
  children: React.ReactNode;
  alertasCriticas: number;
  totalEquipos: number;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [offline, setOffline] = useState(false);
  const { isActive: helpMode } = useHelpMode();
  const pathname = usePathname();

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline  = () => setOffline(false);
    setOffline(!navigator.onLine);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  // Páginas que no usan el shell (login, etc.)
  const sinShell = pathname === "/login";
  if (sinShell) return <>{children}</>;

  return (
    <>
    {/* Skip-to-content (a11y) */}
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#09090B] focus:text-white focus:text-[13px] focus:font-semibold focus:shadow-lg"
    >
      Ir al contenido principal
    </a>

    {/* Offline banner */}
    {offline && (
      <div className="fixed top-0 left-0 right-0 z-[9998] flex items-center justify-center gap-2 px-4 py-2 bg-[#B91C1C] text-white text-[13px] font-medium">
        <WifiOff size={14} />
        Sin conexión a internet — los datos podrían no estar actualizados
      </div>
    )}

    <div className={`flex h-screen overflow-hidden bg-[#F8FAFC] ${helpMode && offline ? "mt-[76px]" : helpMode ? "mt-[40px]" : offline ? "mt-[36px]" : ""}`}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} totalEquipos={totalEquipos} alertasCriticas={alertasCriticas} />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} totalEquipos={totalEquipos} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6 pb-[calc(56px+env(safe-area-inset-bottom))] lg:pb-6"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

      <BottomNav alertasCriticas={alertasCriticas} />
    </div>
    </>
  );
}
