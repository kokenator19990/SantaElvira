import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getFlota } from "@/lib/db/queries/flota";
import { getAlertas } from "@/lib/db/queries/alertas";
import { getKpisDeltaFlota } from "@/lib/db/queries/tendencias";
import { getPeriodoActual } from "@/lib/db/queries/periodos";
import { calcularResumenFlota } from "@/lib/data/flota-resumen";
import { generarResumenEjecutivo, formatUsd } from "@/lib/domain/resumen-ejecutivo";
import { umbralesDesdeDB } from "@/lib/domain/semaforo";
import { getUmbralesActivos } from "@/lib/db/queries/umbrales";
import type { FlotaResumen } from "@/lib/domain/tipos";

/**
 * GET /api/digest
 *
 * Genera un resumen diario de la flota y opcionalmente lo envía por email.
 *
 * - Sin RESEND_API_KEY: retorna el HTML del digest (útil para preview)
 * - Con RESEND_API_KEY + DIGEST_TO: envía el email y retorna confirmación
 *
 * Diseñado para ser llamado por Vercel Cron Jobs a las 7am.
 *
 * Query params:
 *   ?preview=1  — fuerza retorno HTML sin enviar email
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const preview = searchParams.get("preview") === "1";

  // Verificar secret (Vercel Cron envía CRON_SECRET) — timing-safe compare
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 500 });
  }
  const expected = Buffer.from(`Bearer ${cronSecret}`);
  const actual = Buffer.from(authHeader ?? "");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const [flota, alertas, periodoActual, delta, umbralesDB] = await Promise.all([
      getFlota(),
      getAlertas(),
      getPeriodoActual(),
      getKpisDeltaFlota(),
      getUmbralesActivos(),
    ]);
    const umbrales = umbralesDesdeDB(umbralesDB);

    const flotas: FlotaResumen[] = [
      calcularResumenFlota("785D", "CAT 785D", flota),
      calcularResumenFlota("777F", "CAT 777F", flota),
      calcularResumenFlota("992", "CAT 992", flota),
      calcularResumenFlota("PC2000", "Komatsu PC-2000", flota),
    ];

    const periodoLabel = periodoActual?.label ?? "Sin datos";
    const resumen = generarResumenEjecutivo(flota, flotas, delta, periodoLabel,
      periodoActual ? { anio: periodoActual.anio, mes: periodoActual.mes } : undefined);

    const enParo = flota.filter((e) => e.paroTotal).length;
    const criticos = flota.filter((e) => !e.paroTotal && e.semaforo.general === "rojo").length;
    const activos = flota.filter((e) => !e.paroTotal);
    const dfmVals = activos.map((e) => e.kpis.dfm).filter(Number.isFinite);
    const dfmProm = dfmVals.length > 0
      ? Math.round(dfmVals.reduce((a, v) => a + v, 0) / dfmVals.length * 10) / 10
      : 0;

    const fecha = new Date().toLocaleDateString("es-CL", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

    const estadoColor = resumen.estado === "critico" ? "#DC2626"
      : resumen.estado === "advertencia" ? "#D97706" : "#16A34A";
    const estadoLabel = resumen.estado === "critico" ? "CRITICO"
      : resumen.estado === "advertencia" ? "ADVERTENCIA" : "ESTABLE";

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F4F4F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:600px;margin:24px auto;background:white;border-radius:12px;overflow:hidden;border:1px solid #E4E4E7">

  <!-- Header -->
  <div style="background:#09090B;padding:20px 24px;color:white">
    <h1 style="margin:0;font-size:18px;font-weight:700">Resumen Diario — MSG El Salvador</h1>
    <p style="margin:4px 0 0;font-size:13px;color:#A1A1AA">${fecha} · ${periodoLabel}</p>
  </div>

  <!-- Estado -->
  <div style="padding:16px 24px;border-bottom:1px solid #E4E4E7;display:flex;align-items:center;gap:12px">
    <span style="display:inline-block;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:700;color:white;background:${estadoColor}">${estadoLabel}</span>
    <span style="font-size:13px;color:#52525B">${flota.length} equipos · ${alertas.length} alertas activas</span>
  </div>

  <!-- KPIs -->
  <div style="padding:16px 24px;border-bottom:1px solid #E4E4E7">
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="text-align:center;padding:8px">
          <div style="font-size:11px;color:#71717A;text-transform:uppercase;letter-spacing:0.1em">DFM Flota</div>
          <div style="font-size:28px;font-weight:700;color:${dfmProm >= umbrales.dfm.verde ? '#16A34A' : dfmProm >= umbrales.dfm.ambar ? '#D97706' : '#DC2626'}">${dfmProm}%</div>
        </td>
        <td style="text-align:center;padding:8px">
          <div style="font-size:11px;color:#71717A;text-transform:uppercase;letter-spacing:0.1em">En paro</div>
          <div style="font-size:28px;font-weight:700;color:${enParo > 0 ? '#DC2626' : '#16A34A'}">${enParo}</div>
        </td>
        <td style="text-align:center;padding:8px">
          <div style="font-size:11px;color:#71717A;text-transform:uppercase;letter-spacing:0.1em">Críticos</div>
          <div style="font-size:28px;font-weight:700;color:${criticos > 0 ? '#DC2626' : '#16A34A'}">${criticos}</div>
        </td>
        <td style="text-align:center;padding:8px">
          <div style="font-size:11px;color:#71717A;text-transform:uppercase;letter-spacing:0.1em">Pérdida est.</div>
          <div style="font-size:28px;font-weight:700;color:#B91C1C">${formatUsd(resumen.perdidaEstimadaUsd)}</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- Resumen ejecutivo -->
  <div style="padding:16px 24px;border-bottom:1px solid #E4E4E7">
    <h2 style="margin:0 0 8px;font-size:14px;font-weight:700;color:#09090B">Resumen Ejecutivo</h2>
    <ul style="margin:0;padding:0 0 0 16px;color:#52525B;font-size:13px;line-height:1.6">
      ${resumen.bullets.map((b) => `<li>${b}</li>`).join("\n      ")}
    </ul>
  </div>

  <!-- Top alertas -->
  ${alertas.length > 0 ? `
  <div style="padding:16px 24px;border-bottom:1px solid #E4E4E7">
    <h2 style="margin:0 0 8px;font-size:14px;font-weight:700;color:#09090B">Alertas Prioritarias${alertas.length > 5 ? ` (mostrando 5 de ${alertas.length})` : ""}</h2>
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      ${alertas.slice(0, 5).map((a) => `
      <tr style="border-bottom:1px solid #F4F4F5">
        <td style="padding:6px 4px;font-weight:700;color:#09090B">${a.equipoId}</td>
        <td style="padding:6px 4px;color:#71717A">${a.modelo}</td>
        <td style="padding:6px 4px;color:${a.estado === 'rojo' || a.estado === 'paro' ? '#DC2626' : '#D97706'}">${a.mensaje}</td>
      </tr>`).join("")}
    </table>${alertas.length > 5 ? `
    <p style="margin:8px 0 0;font-size:11px;color:#A1A1AA">Ver las ${alertas.length - 5} alertas restantes en el dashboard.</p>` : ""}
  </div>` : ""}

  <!-- Footer -->
  <div style="padding:16px 24px;text-align:center">
    <p style="margin:0;font-size:12px;color:#A1A1AA">
      Dashboard KPI MSG · Generado automáticamente
    </p>
  </div>

</div>
</body></html>`;

    // ── Enviar email si está configurado ──
    if (!preview && process.env.RESEND_API_KEY && process.env.DIGEST_TO) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.DIGEST_FROM ?? "MSG Dashboard <noreply@resend.dev>",
          to: process.env.DIGEST_TO.split(",").map((e) => e.trim()),
          subject: `[MSG] Resumen ${fecha} — ${estadoLabel} · DFM ${dfmProm}%`,
          html,
        }),
      });

      if (!res.ok) {
        console.error("Resend API error:", await res.text());
        return NextResponse.json({ error: "Error enviando email" }, { status: 500 });
      }

      return NextResponse.json({
        sent: true,
        estado: resumen.estado,
        alertas: alertas.length,
      });
    }

    // Sin configuración de email → retorna HTML para preview
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });

  } catch {
    return NextResponse.json({ error: "Error interno al generar el digest" }, { status: 500 });
  }
}
