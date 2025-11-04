"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

export default function DashboardClient({ kpis, series, ultIng, ultEgr }) {
  // kpis: { ingresos12, egresos12, saldo12 }
  // series: [ { month: "2025-01", ingresos: 123, egresos: 50, saldo: 73 }, ... ]
  // ultIng: últimos ingresos
  // ultEgr: últimos egresos

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border border-slate-200">
          <div className="text-sm text-slate-500">Ingresos últimos 12 meses</div>
          <div className="text-2xl font-semibold text-slate-800">
            ${kpis.ingresos12.toLocaleString("es-CO")}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border border-slate-200">
          <div className="text-sm text-slate-500">Egresos últimos 12 meses</div>
          <div className="text-2xl font-semibold text-red-600">
            ${kpis.egresos12.toLocaleString("es-CO")}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border border-slate-200">
          <div className="text-sm text-slate-500">Saldo neto (12m)</div>
          <div
            className={`text-2xl font-semibold ${
              kpis.saldo12 >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            ${kpis.saldo12.toLocaleString("es-CO")}
          </div>
        </div>
      </section>

      {/* GRÁFICO */}
      <section className="bg-white rounded-xl shadow border border-slate-200 p-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">
          Flujo mensual (12 meses)
        </h2>

        {/* Aquí es donde arreglamos el problema del width/height = -1 */}
        <div
          style={{
            width: "100%",
            height: 260, // altura fija => Recharts deja de quejarse
            minWidth: 0,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="ingresos"
                stroke="#10b981" // verde
                name="Ingresos"
              />
              <Line
                type="monotone"
                dataKey="egresos"
                stroke="#ef4444" // rojo
                name="Egresos"
              />
              <Line
                type="monotone"
                dataKey="saldo"
                stroke="#3b82f6" // azul
                name="Saldo acumulado"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* TABLAS RECIENTES */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos ingresos */}
        <div className="bg-white rounded-xl shadow border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Últimos ingresos
          </h2>
          <ul className="divide-y divide-slate-100 text-sm">
            {ultIng.map((r) => (
              <li key={r.id} className="py-2 flex flex-col">
                <span className="text-slate-800 font-medium">
                  {r.concepto || "Sin concepto"}
                </span>
                <span className="text-slate-500 flex flex-wrap gap-2 text-xs">
                  <span>
                    Fecha:{" "}
                    {r.fecha_ingreso
                      ? new Date(r.fecha_ingreso).toLocaleDateString("es-CO")
                      : "—"}
                  </span>
                  <span>
                    Valor: $
                    {(
                      r.valor_consignado ??
                      r.valor_total ??
                      0
                    ).toLocaleString("es-CO")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Últimos egresos */}
        <div className="bg-white rounded-xl shadow border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Últimos egresos
          </h2>
          <ul className="divide-y divide-slate-100 text-sm">
            {ultEgr.map((r) => {
              const sub =
                Number(r.cantidad ?? 0) * Number(r.valor_unitario ?? 0);
              const neto =
                sub - sub * (Number(r.retencion ?? 0) / 100 || 0);

              return (
                <li key={r.id} className="py-2 flex flex-col">
                  <span className="text-slate-800 font-medium">
                    {r.concepto || "Sin concepto"}
                  </span>
                  <span className="text-slate-500 flex flex-wrap gap-2 text-xs">
                    <span>
                      Fecha:{" "}
                      {r.created_at
                        ? new Date(r.created_at).toLocaleDateString("es-CO")
                        : "—"}
                    </span>
                    <span>Valor neto: ${neto.toLocaleString("es-CO")}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}

