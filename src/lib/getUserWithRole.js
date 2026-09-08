import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function getUserWithRole() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Solo lectura desde Server Components
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      user: null,
      role: null,
      nombre: null,
      activo: false,
    };
  }

  const { data: roleRow, error: roleError } = await supabase
    .from("user_roles")
    .select("role, nombre_visible, activo")
    .eq("user_id", user.id)
    .maybeSingle();

  if (roleError) {
    console.error("[getUserWithRole] roleError:", roleError);
  }
console.log("[getUserWithRole] user.id:", user.id);
console.log("[getUserWithRole] roleRow:", roleRow);
console.log("[getUserWithRole] roleError:", roleError);
  if (!roleRow) {
    return {
      user,
      role: null,
      nombre: user.email,
      activo: false,
    };
  }

  return {
    user,
    role: roleRow.role,
    nombre: roleRow.nombre_visible ?? user.email,
    activo: roleRow.activo,
  };
}