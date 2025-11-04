import { redirect } from "next/navigation";
import PrivateHeader from "@/components/PrivateHeader";
import RecibosClient from "./RecibosClient";
import { getSupabaseServerReadonly } from "@/lib/supabaseServerReadonly";

export const dynamic = "force-dynamic";

export default async function RecibosPage() {
  const { supabase } = await getSupabaseServerReadonly();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) redirect("/auth");

  const { data: ingresos, error: qErr } = await supabase
    .from("ingresos")
    .select("id, convenio, consecutivo, entidad_nombre, entidad_nit, concepto, fecha_ingreso")
    .order("convenio", { ascending: true })
    .order("consecutivo", { ascending: true });

  if (qErr) {
    console.error("Error cargando ingresos:", qErr);
  }

  return (
    <>
      <PrivateHeader />
      <main className="max-w-7xl mx-auto px-6 py-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Recibos (Ingresos)</h1>
        <RecibosClient initialData={ingresos ?? []} />
      </main>
    </>
  );
}
