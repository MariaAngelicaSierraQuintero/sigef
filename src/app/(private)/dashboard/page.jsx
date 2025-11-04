// src/app/(private)/dashboard/page.jsx
import { getSupabaseServerReadonly } from "@/lib/supabaseServerReadonly";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ==== Helpers de fecha y agregación ==== */
function parseDateLike(v) {
  if (!v) return null;
  if (v instanceof Date) return v;

  if (typeof v === "string") {
    // "2025-10-31" o "2025-10-31T14:22:00Z"
    if (/^\d{4}-\d{2}-\d{2}/.test(v)) return new Date(v);

    // "31/10/2025"
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
      const [dd, mm, yyyy] = v.split("/");
      return new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
    }
  }

  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

function keyYM(date) {
  // 2025-03
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

// Serie mensual para la gráfica (12 meses)
function groupByMonth({ ingresos, egresos }) {
  const now = new Date();
  const first = startOfMonth(addMonths(now, -11)); // hace 11 meses hasta hoy = 12 meses

  // prearmo 12 buckets
  const months = [];
  const idx = new Map();
  for (let i = 0; i < 12; i++) {
    const d = addMonths(first, i);
    const k = keyYM(d);
    months.push({ month: k, ingresos: 0, egresos: 0 });
    idx.set(k, i);
  }

  // ingresos válidos
  for (const r of ingresos || []) {
    const d = parseDateLike(r.fecha_ingreso);
    if (!d) continue;
    const k = keyYM(d);
    if (!idx.has(k)) continue;

    const v = Number(r.valor_consignado ?? r.valor_total ?? 0);
    months[idx.get(k)].ingresos += v;
  }

  // egresos válidos
  for (const r of egresos || []) {
    const d = parseDateLike(r.created_at || r.fecha || r.inserted_at);
    if (!d) continue;
    const k = keyYM(d);
    if (!idx.has(k)) continue;

    const cantidad = Number(r.cantidad ?? 0);
    const vu = Number(r.valor_unitario ?? 0);
    const ret = Number(r.retencion ?? 0);

    const sub = cantidad * vu;
    const neto = sub - sub * (ret / 100);

    months[idx.get(k)].egresos += neto;
  }

  // saldo acumulado en el tiempo
  let acc = 0;
  for (const m of months) {
    acc += m.ingresos - m.egresos;
    m.saldo = acc;
  }

  return months;
}

// reintento suave por si Supabase suelta 429
async function withRetry(fn, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const is429 =
        err?.status === 429 || err?.code === "over_request_rate_limit";
      if (!is429 || i === tries - 1) throw err;
      // backoff chiquito
      await new Promise((r) => setTimeout(r, 300 * (i + 1)));
    }
  }
  throw lastErr;
}

export default async function DashboardPage() {
  const { supabase } = await getSupabaseServerReadonly();

  const today = new Date();
  const twelveMonthsAgo = new Date(
    today.getFullYear(),
    today.getMonth() - 11,
    1
  );
  const fromISO = twelveMonthsAgo.toISOString();

  // === 1. Traer ingresos y egresos de los últimos ~12 meses
  // Incluimos campo 'anulado' para poder filtrar.
  const [ingRes, egrRes] = await Promise.all([
    withRetry(async () => {
      const { data, error } = await supabase
        .from("ingresos")
        .select(
          `
          id,
          fecha_ingreso,
          valor_total,
          valor_consignado,
          concepto,
          anulado
        `
        )
        .gte("fecha_ingreso", fromISO)
        .order("fecha_ingreso", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data || [];
    }),
    withRetry(async () => {
      const { data, error } = await supabase
        .from("egresos")
        .select(
          `
          id,
          created_at,
          cantidad,
          valor_unitario,
          retencion,
          concepto,
          anulado
        `
        )
        .gte("created_at", fromISO)
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data || [];
    }),
  ]);

  // === 2. Filtrar anulados
  const ingresosValidos = ingRes.filter((r) => !r.anulado);
  const egresosValidos = egrRes.filter((r) => !r.anulado);

  // === 3. KPIs
  const ingresos12Total = ingresosValidos.reduce(
    (acc, r) => acc + Number(r.valor_consignado ?? r.valor_total ?? 0),
    0
  );

  const egresos12Total = egresosValidos.reduce((acc, r) => {
    const sub = Number(r.cantidad ?? 0) * Number(r.valor_unitario ?? 0);
    const neto = sub - sub * (Number(r.retencion ?? 0) / 100);
    return acc + neto;
  }, 0);

  const saldo12 = ingresos12Total - egresos12Total;

  // === 4. Últimos 5 ingresos válidos
  const ultIng = [...ingresosValidos]
    .sort(
      (a, b) =>
        parseDateLike(b.fecha_ingreso) - parseDateLike(a.fecha_ingreso)
    )
    .slice(0, 5)
    .map((r) => ({
      id: r.id,
      fecha_ingreso: r.fecha_ingreso,
      concepto: r.concepto,
      valor_consignado: r.valor_consignado,
      valor_total: r.valor_total,
    }));

  // === 5. Últimos 5 egresos válidos
  const ultEgr = [...egresosValidos]
    .sort(
      (a, b) =>
        parseDateLike(b.created_at || b.fecha || b.inserted_at) -
        parseDateLike(a.created_at || a.fecha || a.inserted_at)
    )
    .slice(0, 5)
    .map((r) => ({
      id: r.id,
      created_at: r.created_at,
      concepto: r.concepto,
      cantidad: r.cantidad,
      valor_unitario: r.valor_unitario,
      retencion: r.retencion,
    }));

  // === 6. Serie mensual para la gráfica
  const series = groupByMonth({
    ingresos: ingresosValidos,
    egresos: egresosValidos,
  });

  // === 7. Render
  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Panel de Control
      </h1>

      <DashboardClient
        kpis={{
          ingresos12: ingresos12Total,
          egresos12: egresos12Total,
          saldo12,
        }}
        series={series}
        ultIng={ultIng}
        ultEgr={ultEgr}
      />
    </>
  );
}
