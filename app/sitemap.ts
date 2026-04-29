import type { MetadataRoute } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const BASE_URL = "https://kspa.online";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabaseAdminClient();

  // Fetch all published spa slugs
  const { data: spas } = await supabase
    .from("spas")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  // Fetch all published blog posts and guides
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, post_type, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  const spaUrls: MetadataRoute.Sitemap = (spas ?? []).map((spa) => ({
    url: `${BASE_URL}/spas/${spa.slug}`,
    lastModified: spa.updated_at ? new Date(spa.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const postUrls: MetadataRoute.Sitemap = (posts ?? []).map((post) => {
    const section = post.post_type === "guide" ? "guides" : "blog";
    return {
      url: `${BASE_URL}/${section}/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      changeFrequency: "monthly",
      priority: post.post_type === "guide" ? 0.7 : 0.6,
    };
  });

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/spas`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/guides`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/advertise`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [...staticUrls, ...spaUrls, ...postUrls];
}
