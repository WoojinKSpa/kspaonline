import type { Route } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { DeletePostButton } from "@/components/admin/delete-post-button";
import { listAllBlogPosts } from "@/lib/blog-posts";

export const metadata = { title: "Blog Posts | Admin" };

type Props = {
  searchParams?: Promise<{ deleted?: string }>;
};

export default async function AdminBlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const deleted = params?.deleted === "1";
  const posts = await listAllBlogPosts();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <PageIntro eyebrow="Admin" title="Blog posts" description="Create and manage guides, tips, and editorial content." />
        <Button asChild className="shrink-0">
          <Link href={"/admin/blog/new" as Route}>
            <Plus data-icon="inline-start" />
            New post
          </Link>
        </Button>
      </div>

      {deleted && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Post deleted.
        </div>
      )}

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">No posts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first guide or blog post to get started.
          </p>
          <Button asChild className="mt-4">
            <Link href={"/admin/blog/new" as Route}>New post</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-secondary/30">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Published</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Updated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-border last:border-b-0 hover:bg-secondary/20">
                  <td className="px-4 py-3 font-medium">
                    <Link href={(`/admin/blog/${post.id}`) as Route} className="hover:text-primary hover:underline">
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <TypePill type={post.post_type} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={post.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(post.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Link href={(`/admin/blog/${post.id}`) as Route} className="text-sm font-medium text-primary hover:underline">
                        Edit
                      </Link>
                      {post.status === "published" && (
                        <Link
                          href={(publicUrl(post.post_type, post.slug)) as Route}
                          target="_blank"
                          className="text-sm font-medium text-green-700 hover:underline"
                        >
                          View live ↗
                        </Link>
                      )}
                      <DeletePostButton id={post.id} title={post.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function publicUrl(type: string, slug: string): string {
  if (type === "blog") return `/blog/${slug}`;
  if (type === "page") return `/p/${slug}`;
  return `/guides/${slug}`;
}

function TypePill({ type }: { type: string }) {
  const map: Record<string, { label: string; className: string }> = {
    guide:  { label: "Guide",     className: "bg-blue-100 text-blue-800" },
    blog:   { label: "Blog post", className: "bg-purple-100 text-purple-800" },
    page:   { label: "Page",      className: "bg-gray-100 text-gray-700" },
  };
  const { label, className } = map[type] ?? map.guide;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
      status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
    }`}>
      {status}
    </span>
  );
}
