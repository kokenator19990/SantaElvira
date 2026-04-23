import type { Equipo, FlotaResumen } from "@/lib/domain/tipos";

interface ReportePreviewProps {
  periodo: string;
  flotas: FlotaResumen[];
  equiposCriticos: Equipo[];
  equiposEnParo: Equipo[];
}

export function ReportePreview({ periodo, flotas, equiposCriticos, equiposEnParo }: ReportePreviewProps) {
  const fechaGeneracion = new Date().toLocaleDateString("es-CL", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <div className="print-target bg-white text-black p-8 rounded-xl max-w-4xl mx-auto" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Encabezado */}
      <div className="flex items-start justify-between border-b-2 border-gray-900 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">INFORME MENSUAL FLOTA</h1>
          <p className="text-gray-600 mt-1">Mining Services Group Ltda. — Faena El Salvador</p>
          <p className="text-sm text-gray-500 mt-0.5">Período: {periodo}</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Generado: {fechaGeneracion}</p>
          <p className="font-mono text-xs mt-1">Dashboard KPI MSG v1.0</p>
        </div>
      </div>

      {/* Resumen ejecutivo */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 border-l-4 border-gray-900 pl-3 mb-4">
          1. Resumen Ejecutivo por Flota
        </h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left">Flota</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Equipos</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Dfm (%)</th>
              <th className="border border-gray-300 px-3 py-2 text-center">TMEF (h)</th>
              <th className="border border-gray-300 px-3 py-2 text-center">TMPR (h)</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {flotas.map((f) => (
              <tr key={f.tipo}>
                <td className="border border-gray-300 px-3 py-2 font-medium">{f.modelo}</td>
                <td className="border border-gray-300 px-3 py-2 text-center">{f.cantidad}</td>
                <td className="border border-gray-300 px-3 py-2 text-center font-mono">{f.dfmPromedio}%</td>
                <td className="border border-gray-300 px-3 py-2 text-center font-mono">{f.tmefPromedio}h</td>
                <td className="border border-gray-300 px-3 py-2 text-center font-mono">{f.tmprPromedio}h</td>
                <td className="border border-gray-300 px-3 py-2 text-center uppercase text-xs font-bold">
                  {f.semaforoGeneral}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Equipos en paro */}
      {equiposEnParo.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 border-l-4 border-red-600 pl-3 mb-4">
            2. Equipos en Paro Total
          </h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-red-50">
                <th className="border border-gray-300 px-3 py-2 text-left">ID</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Modelo</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {equiposEnParo.map((e) => (
                <tr key={e.id} className="bg-red-50">
                  <td className="border border-gray-300 px-3 py-2 font-mono font-bold">{e.id}</td>
                  <td className="border border-gray-300 px-3 py-2">{e.modelo}</td>
                  <td className="border border-gray-300 px-3 py-2">{e.motivoParo ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Equipos críticos */}
      {equiposCriticos.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 border-l-4 border-amber-500 pl-3 mb-4">
            3. Equipos en Estado Crítico (Dfm &lt; 75%)
          </h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left">ID</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Modelo</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Dfm</th>
                <th className="border border-gray-300 px-3 py-2 text-center">TMEF</th>
                <th className="border border-gray-300 px-3 py-2 text-center">TMPR</th>
              </tr>
            </thead>
            <tbody>
              {equiposCriticos.map((e) => (
                <tr key={e.id}>
                  <td className="border border-gray-300 px-3 py-2 font-mono font-bold">{e.id}</td>
                  <td className="border border-gray-300 px-3 py-2">{e.modelo}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-mono">{e.kpis.dfm}%</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-mono">{e.kpis.tmef}h</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-mono">{e.kpis.tmpr}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Pie */}
      <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between text-xs text-gray-400">
        <span>MSG — Dashboard KPI El Salvador</span>
        <span>Confidencial — Solo uso interno</span>
        <span>Generado automáticamente</span>
      </div>
    </div>
  );
}
