import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export async function getUserWithRole() {
  // 1. leer cookies una sola vez
  const cookieStore = await cookies();

  // 2. crear supabase server-component client SOLO LECTURA
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  });

  // 3. obtener usuario autenticado actual
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { user: null, role: null, nombre: null, activo: false };
  }

  // 4. buscar registro de rol
  const { data: roleRow, error: roleError } = await supabase
    .from("user_roles")
    .select("role, nombre_visible, activo")
    .eq("user_id", user.id)
    .maybeSingle();

  if (roleError) {
    console.error("[getUserWithRole] roleError:", roleError);
  }

  if (!roleRow) {
    // tiene sesión pero no está en user_roles
    return { user, role: null, nombre: user.email, activo: false };
  }

  return {
    user,
    role: roleRow.role,
    nombre: roleRow.nombre_visible ?? user.email,
    activo: roleRow.activo,
  };
}

