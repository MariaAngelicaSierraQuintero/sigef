"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookieStore = await cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });
  await supabase.auth.signOut();
  redirect("/auth");
}
