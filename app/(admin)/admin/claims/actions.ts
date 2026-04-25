"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { approveClaim, rejectClaim } from "@/lib/spa-claims";

export async function approveClaimAction(formData: FormData) {
  const claim_id = formData.get("claim_id") as string;
  const spa_id = formData.get("spa_id") as string;
  const owner_email = formData.get("owner_email") as string;

  if (!claim_id || !spa_id || !owner_email) {
    redirect("/admin/claims?error=Missing+required+fields" as Route);
  }

  const result = await approveClaim(claim_id, spa_id, owner_email);

  if (!result.success) {
    redirect(
      `/admin/claims?error=${encodeURIComponent(result.error || "Failed to approve claim")}` as Route
    );
  }

  revalidatePath("/admin/claims");
  redirect("/admin/claims?success=Claim+approved" as Route);
}

export async function rejectClaimAction(formData: FormData) {
  const claim_id = formData.get("claim_id") as string;

  if (!claim_id) {
    redirect("/admin/claims?error=Missing+claim+ID" as Route);
  }

  const result = await rejectClaim(claim_id);

  if (!result.success) {
    redirect(
      `/admin/claims?error=${encodeURIComponent(result.error || "Failed to reject claim")}` as Route
    );
  }

  revalidatePath("/admin/claims");
  redirect("/admin/claims?success=Claim+rejected" as Route);
}
