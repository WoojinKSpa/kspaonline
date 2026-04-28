"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { submitAdvertisingLead } from "@/lib/ad-campaigns";

export async function submitAdvertisingLeadAction(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const company_name = (formData.get("company_name") as string | null)?.trim() || undefined;
  const website = (formData.get("website") as string | null)?.trim() || undefined;
  const phone = (formData.get("phone") as string | null)?.trim() || undefined;
  const message = (formData.get("message") as string | null)?.trim() || undefined;
  const interest = (formData.get("interest") as string | null)?.trim() || undefined;

  if (!name || !email) {
    redirect("/advertise?error=Name+and+email+are+required" as Route);
  }

  try {
    await submitAdvertisingLead({ name, email, company_name, website, phone, message, interest });
  } catch {
    redirect("/advertise?error=Something+went+wrong.+Please+try+again." as Route);
  }

  redirect("/advertise?success=1" as Route);
}
