import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { Container } from "@/components/layout/container";
import { PageIntro } from "@/components/layout/page-intro";
import { listPublishedBlogPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Guides & Tips | KSpa Online",
  description: "Expert guides, etiquette tips, and everything you need to know about Korean spas.",
};

export default async function GuidesPage() {
  const posts = await listPublishedBlogPosts();

  return (
    <div className="pb-20">
      <Container className="py-12">
        <PageIntro
          eyebrow="Guides"
          title="Korean Spa Guides & Tips"
          description="Expert guides, etiquette tips, and everything you need to know before your next visit."
        />

        {posts.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <BookOpen className="mx-auto size-10 text-muted-foreground/30" />
            <p className="mt-4 text-sm font-medium text-foreground">Guides coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;re working on helpful guides to make your spa experience better.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={(`/guides/${post.slug}`) as Route}
                className="group surface flex flex-col gap-4 p-6 shadow-[0_12px_36px_-28px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5"
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-primary">
                    Guide
                  </p>
                  <h2 className="mt-2 text-xl font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                </div>
                {post.excerpt && (
                  <p className="flex-1 text-sm leading-6 text-muted-foreground">
                    {post.excerpt}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : null}
                </p>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
