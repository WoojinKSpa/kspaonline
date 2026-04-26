"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { setProfileRole } from "@/lib/profiles";
import type { UserRole } from "@/lib/profiles";

export async function setUserRoleAction(formData: FormData) {
  const user_id = formData.get("user_id") as string;
  const role = formData.get("role") as UserRole;

  const validRoles: UserRole[] = ["admin", "owner", "user", "advertiser"];
  if (!user_id || !validRoles.includes(role)) {
    redirect("/admin/users?error=Invalid+request" as Route);
  }

  const result = await setProfileRole(user_id, role);

  if (!result.success) {
    redirect(
      `/admin/users?error=${encodeURIComponent(result.error || "Failed to update role")}` as Route
    );
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?success=Role+updated" as Route);
}
