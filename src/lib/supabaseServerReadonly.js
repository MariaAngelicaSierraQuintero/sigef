import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

/**
 * Cliente Supabase para páginas/layouts server (solo lectura).
 * - Siempre await cookies() en Next 15.
 */
export async function getSupabaseServerReadonly() {
  const store = await cookies(); // <- importante

  const supabase = createServerComponentClient({
    cookies: () => store, // pasar el store ya resuelto (evita el error de sync cookies)
  });

  return { supabase };
}
