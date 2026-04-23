"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminSpa, updateAdminSpa } from "@/lib/admin-spas";

export async function createSpaAction(formData: FormData) {
  const createdSpa = await createAdminSpa(formData);

  revalidatePath("/admin" as Route);
  revalidatePath("/admin/spas" as Route);
  revalidatePath("/spas" as Route);

  redirect(`/admin/spas/${createdSpa.id}` as Route);
}

export async function updateSpaAction(id: string, formData: FormData) {
  await updateAdminSpa(id, formData);

  revalidatePath("/admin" as Route);
  revalidatePath("/admin/spas" as Route);
  revalidatePath(`/admin/spas/${id}` as Route);
  revalidatePath("/spas" as Route);

  redirect("/admin/spas" as Route);
}
