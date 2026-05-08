import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { ShellClient } from "@/components/layout/ShellClient";
import { HelpModeProvider } from "@/contexts/HelpModeContext";
import { HelpModeBanner } from "@/components/ui/HelpModeBanner";
import { getFlota } from "@/lib/db/queries/flota";
import { getAlertas } from "@/lib/db/queries/alertas";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Dashboard KPI — MSG El Salvador",
    template: "%s — MSG El Salvador",
  },
  description: "Mining Services Group — Dashboard de disponibilidad y KPIs flota",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

/**
 * Carga los contadores del shell (alertas críticas y total equipos).
 * Se ejecuta en paralelo con el render de la página — no bloquea el shell.
 * React.cache deduplica si la página hija llama las mismas queries.
 */
async function ShellDataProvider({ children }: { children: React.ReactNode }) {
  let alertasCriticas = 0;
  let totalEquipos = 0;
  try {
    const [flota, alertas] = await Promise.all([getFlota(), getAlertas()]);
    alertasCriticas = alertas.filter((a) => a.estado === "paro" || a.estado === "rojo").length;
    totalEquipos = flota.length;
  } catch {
    // BD no disponible — shell degrada silenciosamente; la página mostrará su propio error
  }
  return (
    <ShellClient alertasCriticas={alertasCriticas} totalEquipos={totalEquipos}>
      {children}
    </ShellClient>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <HelpModeProvider>
          <HelpModeBanner />
          {/*
           * Suspense permite que el shell se pinte de inmediato con valores neutros
           * (0 alertas, 0 equipos) mientras ShellDataProvider resuelve los contadores
           * del sidebar. La página hija streama de forma independiente.
           */}
          <Suspense
            fallback={
              <ShellClient alertasCriticas={0} totalEquipos={0}>
                {children}
              </ShellClient>
            }
          >
            <ShellDataProvider>{children}</ShellDataProvider>
          </Suspense>
        </HelpModeProvider>
      </body>
    </html>
  );
}
