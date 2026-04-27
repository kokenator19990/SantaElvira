"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { useHelpMode } from "@/contexts/HelpModeContext";

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
  const { isActive: helpMode } = useHelpMode();

  return (
    <div className={`flex h-screen overflow-hidden bg-[#F8FAFC] ${helpMode ? "mt-[40px]" : ""}`}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} totalEquipos={totalEquipos} />

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
  );
}
