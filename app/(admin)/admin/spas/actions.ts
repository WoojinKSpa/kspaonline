"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminSpa, updateAdminSpa } from "@/lib/admin-spas";
import {
  uploadSpaGalleryImages,
  uploadSpaLogo,
} from "@/lib/spa-images";

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

export async function uploadSpaLogoAction(
  id: string,
  slug: string,
  formData: FormData
) {
  const file = formData.get("logo");

  if (!(file instanceof File) || file.size <= 0) {
    redirect(`/admin/spas/${id}` as Route);
  }

  await uploadSpaLogo(id, file);

  revalidatePath(`/admin/spas/${id}` as Route);
  revalidatePath(`/spas/${slug}` as Route);

  redirect(`/admin/spas/${id}` as Route);
}

export async function uploadSpaGalleryImagesAction(
  id: string,
  slug: string,
  formData: FormData
) {
  const files = formData
    .getAll("gallery")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) {
    redirect(`/admin/spas/${id}` as Route);
  }

  await uploadSpaGalleryImages(id, files);

  revalidatePath(`/admin/spas/${id}` as Route);
  revalidatePath(`/spas/${slug}` as Route);

  redirect(`/admin/spas/${id}` as Route);
}
