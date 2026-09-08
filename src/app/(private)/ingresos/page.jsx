// src/app/(private)/ingresos/page.jsx
import { getSupabaseServerReadonly } from "@/lib/supabaseServerReadonly";
import { redirect } from "next/navigation";
import IngresosClient from "./IngresosClient";

export const dynamic = "force-dynamic";

export default async function IngresosPage() {
  const { supabase } = await getSupabaseServerReadonly();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) redirect("/auth");

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Crear ingreso</h1>
      <IngresosClient />
    </>
  );
}
