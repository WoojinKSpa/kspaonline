"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteOrigin } from "@/lib/auth-helpers";

export async function signUpAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const confirm = formData.get("confirm_password");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof confirm !== "string"
  ) {
    redirect("/signup?error=Invalid+form+submission" as Route);
  }

  if (password !== confirm) {
    redirect("/signup?error=Passwords+do+not+match" as Route);
  }

  if (password.length < 8) {
    redirect("/signup?error=Password+must+be+at+least+8+characters" as Route);
  }

  const supabase = await createSupabaseServerClient();
  const origin = await getSiteOrigin();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // After email confirmation, land on the homepage with a welcome message.
      emailRedirectTo: `${origin}/auth/callback?next=/account`,
    },
  });

  if (error) {
    redirect(
      `/signup?error=${encodeURIComponent(error.message)}` as Route
    );
  }

  // Supabase sends a confirmation email — tell the user to check their inbox.
  redirect("/signup?verify=true" as Route);
}
