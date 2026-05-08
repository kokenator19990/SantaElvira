import type { Metadata } from "next";
export const metadata: Metadata = { title: "Login" };

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Pickaxe, AlertTriangle } from "lucide-react";
import { pbkdf2Sync, timingSafeEqual } from "crypto";
import { createToken } from "@/lib/auth/token";

const SESSION_COOKIE = "admin_session";

/* ─── Rate Limiting ─────────────────────────────────────────────────────────
 * Máximo 5 intentos por IP en 15 minutos. Almacenamiento en memoria (se
 * reinicia con cada deploy, lo cual es aceptable para este nivel de riesgo).
 */
const intentos = new Map<string, { count: number; resetAt: number }>();
const MAX_INTENTOS = 5;
const VENTANA_MS = 15 * 60 * 1000; // 15 min

function verificarRateLimit(ip: string): boolean {
  const ahora = Date.now();
  // Lazy cleanup: si el Map crece más de 500 entradas, purgar expiradas
  if (intentos.size > 500) {
    Array.from(intentos.entries()).forEach(([key, entry]) => {
      if (ahora > entry.resetAt) intentos.delete(key);
    });
  }
  const entry = intentos.get(ip);
  if (!entry || ahora > entry.resetAt) {
    intentos.set(ip, { count: 1, resetAt: ahora + VENTANA_MS });
    return true;
  }
  if (entry.count >= MAX_INTENTOS) return false;
  entry.count++;
  return true;
}

/* ─── Password Hashing ──────────────────────────────────────────────────────
 * Usa PBKDF2 (nativo de Node.js) para comparar passwords de forma segura.
 * El salt se obtiene de ADMIN_SALT (recomendado) o usa una constante interna.
 * No depende de CRON_SECRET para que rotar el cron secret no afecte el login.
 */
function hashPassword(password: string, salt: string): Buffer {
  return pbkdf2Sync(password, salt, 100_000, 64, "sha512");
}

function verificarPassword(inputPassword: string, expectedPassword: string): boolean {
  // ADMIN_SALT es opcional — si no está definido, usa constante interna.
  // Ambos lados (input y expected) se hashean con el mismo salt en cada comparación,
  // por lo que cambiar el salt no invalida el login (ADMIN_PASSWORD se guarda en texto).
  const salt = process.env.ADMIN_SALT ?? "msg-dashboard-kpi-v1";
  const hashInput = hashPassword(inputPassword, salt);
  const hashExpected = hashPassword(expectedPassword, salt);
  return timingSafeEqual(hashInput, hashExpected);
}

async function loginAction(formData: FormData) {
  "use server";

  const usuario  = (formData.get("usuario")  as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const from     = (formData.get("from")     as string | null) ?? "/admin";

  const ADMIN_USER     = process.env.ADMIN_USER;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_USER || !ADMIN_PASSWORD) {
    redirect(`/login?error=config&from=${encodeURIComponent(from)}`);
  }

  // Rate limiting por usuario (en server actions no hay acceso directo a IP)
  const ipKey = `login:${usuario.toLowerCase()}`;
  if (!verificarRateLimit(ipKey)) {
    redirect(`/login?error=rate&from=${encodeURIComponent(from)}`);
  }

  if (usuario === ADMIN_USER && verificarPassword(password, ADMIN_PASSWORD)) {
    const jwtSecret = process.env.ADMIN_JWT_SECRET;
    if (!jwtSecret) {
      redirect(`/login?error=config&from=${encodeURIComponent(from)}`);
    }
    const token = await createToken(jwtSecret);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      maxAge:   60 * 60 * 4, // 4 horas
      path:     "/",
      sameSite: "strict",
    });
    // Validar redirect: solo rutas internas, sin path traversal ni open redirect
    const safeFrom = from.startsWith("/") && !from.startsWith("//") && !from.includes("..") ? from : "/admin";
    redirect(safeFrom);
  }

  redirect(`/login?error=1&from=${encodeURIComponent(from)}`);
}

interface Props {
  searchParams: { error?: string; from?: string };
}

export default function LoginPage({ searchParams }: Props) {
  const from  = searchParams.from ?? "/admin";
  const error = searchParams.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500 shadow-md">
            <Pickaxe size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[16px] font-bold text-[#09090B] leading-none">MSG</p>
            <p className="text-[12px] text-[#A1A1AA]">El Salvador · Faena</p>
          </div>
        </div>

        <div className="p-6 rounded-[12px] bg-white border border-[#E4E4E7] shadow-sm">
          <h1 className="text-[20px] font-bold text-[#09090B] mb-1">Acceso al sistema</h1>
          <p className="text-[13px] text-[#71717A] mb-6">Ingresa tus credenciales de administrador</p>

          {error === "1" && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-[8px] bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C] mb-4">
              <AlertTriangle size={14} />
              Usuario o contraseña incorrectos
            </div>
          )}
          {error === "config" && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-[8px] bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C] mb-4">
              <AlertTriangle size={14} />
              El sistema no está configurado correctamente (variables de entorno faltantes)
            </div>
          )}
          {error === "rate" && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-[8px] bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C] mb-4">
              <AlertTriangle size={14} />
              Demasiados intentos. Espera 15 minutos antes de intentar de nuevo.
            </div>
          )}

          <form action={loginAction} className="flex flex-col gap-4">
            <input type="hidden" name="from" value={from} />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="usuario" className="text-[13px] font-medium text-[#3F3F46]">
                Usuario
              </label>
              <input
                id="usuario"
                name="usuario"
                type="text"
                autoComplete="username"
                required
                placeholder="msg"
                className="px-3 py-2.5 rounded-[8px] bg-white border border-[#E4E4E7] text-[14px] text-[#09090B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#B45309] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[13px] font-medium text-[#3F3F46]">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="px-3 py-2.5 rounded-[8px] bg-white border border-[#E4E4E7] text-[14px] text-[#09090B] focus:outline-none focus:border-[#B45309] transition-colors"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full px-4 py-2.5 rounded-[8px] bg-[#09090B] hover:bg-[#27272A] text-white text-[14px] font-semibold transition-colors duration-150"
            >
              Ingresar
            </button>
          </form>
        </div>

        <div className="mt-4 w-full flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/opencore-logo.png"
            alt="OpenCore Business Flow"
            className="w-1/2 h-auto"
            style={{ filter: "invert(1)", opacity: 0.75 }}
          />
        </div>
      </div>
    </div>
  );
}
