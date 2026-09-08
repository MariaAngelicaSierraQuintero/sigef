import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Cliente Supabase para páginas/layouts server (solo lectura).
 */
export async function getSupabaseServerReadonly() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  return { supabase };
}