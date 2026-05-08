import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/token";

const SESSION_COOKIE = "admin_session";

const RUTAS_PROTEGIDAS = [
  "/admin", "/reporte", "/explorador",
  "/dashboard", "/alertas", "/flota", "/apd", "/portada",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiereAuth = RUTAS_PROTEGIDAS.some((ruta) => pathname === ruta || pathname.startsWith(ruta + "/"));
  if (requiereAuth) {
    const session = request.cookies.get(SESSION_COOKIE);
    const secret = process.env.ADMIN_JWT_SECRET ?? "";
    const valida = await verifyToken(session?.value, secret);
    if (!valida) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin", "/admin/:path*",
    "/reporte", "/reporte/:path*",
    "/explorador", "/explorador/:path*",
    "/dashboard", "/dashboard/:path*",
    "/alertas", "/alertas/:path*",
    "/flota", "/flota/:path*",
    "/apd", "/apd/:path*",
    "/portada", "/portada/:path*",
  ],
};
