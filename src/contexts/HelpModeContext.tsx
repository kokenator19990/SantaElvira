"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface HelpModeCtx {
  isActive: boolean;
  toggle: () => void;
  deactivate: () => void;
}

const HelpModeContext = createContext<HelpModeCtx>({
  isActive: false,
  toggle: () => {},
  deactivate: () => {},
});

export function HelpModeProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsActive(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <HelpModeContext.Provider
      value={{ isActive, toggle: () => setIsActive((v) => !v), deactivate: () => setIsActive(false) }}
    >
      {children}
    </HelpModeContext.Provider>
  );
}

export const useHelpMode = () => useContext(HelpModeContext);
