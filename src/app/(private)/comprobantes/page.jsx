// src/app/(private)/comprobantes/page.jsx
import { getSupabaseServerReadonly } from "@/lib/supabaseServerReadonly";
import { getUserWithRole } from "@/lib/getUserWithRole";
import ComprobantesClient from "./ComprobantesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ComprobantesPage() {
  // 1. usuario + rol (para permisos de UI)
  const { user, role } = await getUserWithRole();

  // Seguridad adicional en caso de que alguien llegue aquí sin permisos.
  if (!user || !role || role === "inactivo") {
    return (
      <>
        <h1 className="text-2xl font-semibold text-red-600 mb-2">
          Acceso restringido 🚫
        </h1>
        <p className="text-gray-600">
          No tienes permisos para ver comprobantes.
        </p>
      </>
    );
  }

  // 2. supabase server-side solo lectura
  const { supabase } = await getSupabaseServerReadonly();

  // ============================
  // EGRESOS
  // ============================
  const { data: egresos, error: egresosErr } = await supabase
    .from("egresos")
    .select(
      `
        id,
        convenio,
        consecutivo,
        concepto,
        prestador_cedula,
        anulado
      `
    )
    .order("convenio", { ascending: true })
    .order("consecutivo", { ascending: true });

  if (egresosErr) {
    console.error("[egresos] error select:", egresosErr);
  }

  // ============================
  // INGRESOS
  // ============================
  let normIngresos = [];
  try {
    const { data, error } = await supabase
      .from("ingresos")
      .select(
        `
          id,
          convenio,
          consecutivo,
          concepto,
          entidad_nombre,
          entidad_nit,
          anulado
        `
      )
      .order("convenio", { ascending: true })
      .order("consecutivo", { ascending: true });

    if (error) throw error;

    // normalizamos para que ComprobantesClient lo pinte igual que egreso
    normIngresos = (data ?? []).map((r) => ({
      id: r.id,
      convenio: r.convenio,
      consecutivo: r.consecutivo,
      concepto: r.concepto,
      // estos nombres los espera la UI para mostrar "· C.C. ...":
      prestador_nombres: r.entidad_nombre ?? "",
      prestador_cedula: r.entidad_nit ?? "",
      anulado: r.anulado ?? false,
      tipo: "ingreso",
    }));
  } catch (e) {
    console.warn("[ingresos] SELECT falló:", {
      message: e?.message,
      hint: e?.hint,
      details: e?.details,
      code: e?.code,
    });
  }

  // ============================
  // Normalizar egresos
  // ============================
  const normEgresos = (egresos ?? []).map((r) => ({
    ...r,
    anulado: r.anulado ?? false,
    tipo: "egreso",
  }));

  // Mezclamos ingresos + egresos en una sola lista
  const initialData = [...normEgresos, ...normIngresos];

  // ============================
  // Render
  // ============================
  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Comprobantes
      </h1>

      <ComprobantesClient
        initialData={initialData}
        userRole={role}
      />
    </>
  );
}
