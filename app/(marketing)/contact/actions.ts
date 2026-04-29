"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import {
  sendContactNotification,
  sendContactConfirmation,
} from "@/lib/mailerlite";

function clean(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim().slice(0, 2000) : "";
}

export async function submitContactAction(formData: FormData) {
  const name = clean(formData.get("name"));
  const email = clean(formData.get("email"));
  const subject = clean(formData.get("subject")) || "General inquiry";
  const message = clean(formData.get("message"));

  if (!name || !email || !message) {
    redirect(
      ("/contact?error=" +
        encodeURIComponent("Name, email, and message are required.")) as Route
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect(
      ("/contact?error=" +
        encodeURIComponent("Please enter a valid email address.")) as Route
    );
  }

  void Promise.all([
    sendContactNotification({ name, email, subject, message }),
    sendContactConfirmation({ name, email, subject, message }),
  ]).catch((err) => console.error("Contact email error:", err));

  redirect("/contact?success=1" as Route);
}
