"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUserIsAdmin } from "@/lib/admin-auth";
import { type ReviewStatus, updateReviewStatus } from "@/lib/spa-reviews";

const MODERATION_STATUSES = new Set<ReviewStatus>([
  "approved",
  "rejected",
  "hidden",
]);

export async function moderateReviewAction(formData: FormData) {
  const reviewId = String(formData.get("review_id") ?? "");
  const status = String(formData.get("status") ?? "") as ReviewStatus;

  const { isAdmin } = await getCurrentUserIsAdmin();
  if (!isAdmin) {
    redirect("/admin?error=Not+authorized" as Route);
  }

  if (!reviewId || !MODERATION_STATUSES.has(status)) {
    redirect("/admin/reviews?error=Invalid+moderation+request" as Route);
  }

  try {
    await updateReviewStatus(reviewId, status);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update review";
    redirect(`/admin/reviews?error=${encodeURIComponent(message)}` as Route);
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/spas");
  redirect(`/admin/reviews?status=${status}&success=Review+updated` as Route);
}
