import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ShellClient } from "@/components/layout/ShellClient";
import { HelpModeProvider } from "@/contexts/HelpModeContext";
import { HelpModeBanner } from "@/components/ui/HelpModeBanner";

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
  title: "Dashboard KPI — MSG El Salvador",
  description: "Mining Services Group — Dashboard de disponibilidad y KPIs flota",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <HelpModeProvider>
          <HelpModeBanner />
          <ShellClient>{children}</ShellClient>
        </HelpModeProvider>
      </body>
    </html>
  );
}
