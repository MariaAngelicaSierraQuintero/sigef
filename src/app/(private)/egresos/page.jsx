import { redirect } from "next/navigation";
import { getSupabaseServerReadonly } from "@/lib/supabaseServerReadonly";
import EgresosClient from "./EgresosClient";


export const dynamic = "force-dynamic";

export default async function EgresosPage() {
  const { supabase } = await getSupabaseServerReadonly();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  // El layout privado ya incluye el header y el <main>,
  // aquí solo devolvemos el contenido de la página.
  return <EgresosClient />;
}
