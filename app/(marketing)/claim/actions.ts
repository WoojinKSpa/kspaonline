"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPublishedSpaBySlug } from "@/lib/admin-spas";
import { submitClaimRequest } from "@/lib/spa-claims";

export async function submitClaimAction(slug: string, formData: FormData) {
  const requester_name = formData.get("requester_name") as string;
  const requester_email = formData.get("requester_email") as string;
  const message = formData.get("message") as string | null;

  // Validation
  if (!requester_name || !requester_name.trim()) {
    redirect(`/claim/${slug}?error=Name+is+required` as Route);
  }

  if (!requester_email || !requester_email.trim()) {
    redirect(`/claim/${slug}?error=Email+is+required` as Route);
  }

  // Get spa by slug
  const spa = await getPublishedSpaBySlug(slug);
  if (!spa) {
    redirect(`/claim/${slug}?error=Spa+not+found` as Route);
  }

  // Submit claim request
  const result = await submitClaimRequest(
    spa.id,
    requester_name.trim(),
    requester_email.trim(),
    message && message.trim() ? message.trim() : null
  );

  if (!result.success) {
    redirect(
      `/claim/${slug}?error=${encodeURIComponent(result.error || "Failed to submit claim")}` as Route
    );
  }

  // Success - revalidate and redirect with success
  revalidatePath(`/claim/${slug}`);
  redirect(`/claim/${slug}?success=true` as Route);
}
