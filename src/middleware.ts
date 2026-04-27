import { NextResponse, type NextRequest } from "next/server";

/**
 * Protege rutas con HTTP Basic Auth.
 * Las credenciales viven en env vars: ADMIN_USER, ADMIN_PASSWORD.
 * Si las env vars no están definidas, el middleware bloquea TODO el acceso a estas rutas
 * (fail-closed) — esto evita exponer accidentalmente el admin si las vars faltan en prod.
 *
 * Cubre:
 *   - /admin/*  : carga de KPIs, equipos, períodos, regenerar alertas
 *   - /apd      : subir CSV de aceites
 *
 * Pendiente: reemplazar con Supabase Auth en Fase 4 (sesiones, roles, RLS).
 */

const PROTECTED = [/^\/admin(\/|$)/, /^\/apd(\/|$)/];

export function middleware(req: NextRequest) {
  if (!PROTECTED.some((re) => re.test(req.nextUrl.pathname))) {
    return NextResponse.next();
  }

  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPass) {
    return new NextResponse("Admin credentials not configured", { status: 503 });
  }

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) {
    return new NextResponse("Auth required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="MSG Admin"' },
    });
  }

  try {
    const decoded = atob(auth.slice(6));
    const idx = decoded.indexOf(":");
    const user = decoded.slice(0, idx);
    const pass = decoded.slice(idx + 1);
    if (user !== expectedUser || pass !== expectedPass) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  } catch {
    return new NextResponse("Bad credentials", { status: 400 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/apd/:path*"],
};
