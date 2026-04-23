"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo");

  if (typeof email !== "string" || typeof password !== "string") {
    redirect("/login?error=Invalid%20login%20payload");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const destination =
    typeof redirectTo === "string" && redirectTo.startsWith("/")
      ? redirectTo
      : "/admin";

  redirect(destination);
}
