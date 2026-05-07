import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "admin_session";

const RUTAS_PROTEGIDAS = ["/admin", "/reporte", "/explorador"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiereAuth = RUTAS_PROTEGIDAS.some((ruta) => pathname === ruta || pathname.startsWith(ruta + "/"));
  if (requiereAuth) {
    const session = request.cookies.get(SESSION_COOKIE);
    if (!session?.value || session.value.length < 36) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/reporte/:path*", "/explorador/:path*"],
};
