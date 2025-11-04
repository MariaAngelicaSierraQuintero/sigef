"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(prevState, formData) {
  try {
    // 1) leer los campos del form
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      return { error: "Ingresa correo y contraseña." };
    }

    // 2) cookies() AHORA DEBE SER AWAITED en Next 14
    const cookieStore = await cookies();

    // 3) pasar un callback que devuelva ese cookieStore
    const supabase = createServerActionClient({ cookies: () => cookieStore });

    // 4) login
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: error.message || "No se pudo iniciar sesión." };
    }

    // 5) éxito: redirigir (no retornes estado aquí)
    redirect("/dashboard");
  } catch (e) {
    // Evitar que caiga NEXT_REDIRECT en el UI
    if (typeof e?.message === "string" && e.message.includes("NEXT_REDIRECT")) {
      throw e; // dejar que Next maneje el redirect
    }
    return { error: "Ocurrió un error al iniciar sesión." };
  }
}
