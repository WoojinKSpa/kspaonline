"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createBlogPost,
  deleteBlogPost,
  getBlogPostById,
  updateBlogPost,
  type BlogPostStatus,
  type BlogPostType,
} from "@/lib/blog-posts";

export async function createBlogPostAction(formData: FormData) {
  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const slug = (formData.get("slug") as string | null)?.trim() ?? "";
  const excerpt = (formData.get("excerpt") as string | null)?.trim() || null;
  const content = (formData.get("content") as string | null) || null;
  const status = (formData.get("status") as BlogPostStatus) ?? "draft";
  const post_type = (formData.get("post_type") as BlogPostType) ?? "guide";

  if (!title) redirect("/admin/blog/new?error=Title+is+required" as Route);

  let post: Awaited<ReturnType<typeof createBlogPost>> | null = null;
  let errorMsg: string | null = null;

  try {
    post = await createBlogPost({ title, slug: slug || undefined, excerpt, content, status, post_type });
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : "Failed to create post";
  }

  if (errorMsg || !post) {
    redirect(("/admin/blog/new?error=" + encodeURIComponent(errorMsg ?? "Failed to create post")) as Route);
  }

  revalidatePath("/admin/blog" as Route);
  revalidatePath("/guides" as Route);
  revalidatePath("/blog" as Route);
  redirect((`/admin/blog/${post.id}`) as Route);
}

export async function updateBlogPostAction(formData: FormData) {
  const id = formData.get("id") as string;
  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const slug = (formData.get("slug") as string | null)?.trim() ?? "";
  const excerpt = (formData.get("excerpt") as string | null)?.trim() || null;
  const content = (formData.get("content") as string | null) || null;
  const status = (formData.get("status") as BlogPostStatus) ?? "draft";
  const post_type = (formData.get("post_type") as BlogPostType) ?? "guide";

  if (!id || !title) redirect((`/admin/blog/${id}?error=Title+is+required`) as Route);

  const existing = await getBlogPostById(id);
  if (!existing) redirect("/admin/blog" as Route);

  let errorMsg: string | null = null;

  try {
    await updateBlogPost(id, {
      title,
      slug: slug || title,
      excerpt,
      content,
      status,
      post_type,
      previousStatus: existing.status,
      previousPublishedAt: existing.published_at,
    });
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : "Failed to save post";
  }

  if (errorMsg) {
    redirect((`/admin/blog/${id}?error=` + encodeURIComponent(errorMsg)) as Route);
  }

  revalidatePath("/admin/blog" as Route);
  revalidatePath((`/admin/blog/${id}`) as Route);
  revalidatePath("/guides" as Route);
  revalidatePath("/blog" as Route);
  if (existing.slug) {
    revalidatePath((`/guides/${existing.slug}`) as Route);
    revalidatePath((`/blog/${existing.slug}`) as Route);
  }
  redirect((`/admin/blog/${id}?success=1`) as Route);
}

export async function deleteBlogPostAction(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) redirect("/admin/blog" as Route);

  try {
    await deleteBlogPost(id);
    revalidatePath("/admin/blog" as Route);
    revalidatePath("/guides" as Route);
    revalidatePath("/blog" as Route);
  } catch {
    // best-effort
  }

  redirect("/admin/blog?deleted=1" as Route);
}
