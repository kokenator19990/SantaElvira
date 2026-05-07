import type { Metadata, Viewport } from "next";
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Datos compartidos del shell — single round-trip al iniciar la sesión.
  // React.cache deduplica si las páginas hijas también llaman estas queries.
  const [flota, alertas] = await Promise.all([getFlota(), getAlertas()]);
  const alertasCriticas = alertas.filter((a) => a.estado === "paro" || a.estado === "rojo").length;

  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <HelpModeProvider>
          <HelpModeBanner />
          <ShellClient
            alertasCriticas={alertasCriticas}
            totalEquipos={flota.length}
          >
            {children}
          </ShellClient>
        </HelpModeProvider>
      </body>
    </html>
  );
}
