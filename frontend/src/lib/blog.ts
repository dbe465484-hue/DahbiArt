import fallback from "@/data/blog-fallback.json";
import { formatFrenchDate } from "./format-date";

import { API_URL } from "./api-url";

export type BlogPost = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  publishedAt: string;
  published?: boolean;
};

export type BlogPostCard = BlogPost & { dateLabel: string };

function toCard(post: BlogPost): BlogPostCard {
  return { ...post, dateLabel: formatFrenchDate(post.publishedAt) };
}

function staticPosts(): BlogPostCard[] {
  return fallback.posts.map((p) => toCard(p as BlogPost));
}

export async function getBlogPosts(): Promise<BlogPostCard[]> {
  try {
    const res = await fetch(`${API_URL}/blog-posts`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return staticPosts();
    const data = (await res.json()) as BlogPost[];
    return data.map((p) => toCard(p));
  } catch {
    return staticPosts();
  }
}

export async function getBlogPost(slug: string): Promise<BlogPostCard | null> {
  try {
    const res = await fetch(`${API_URL}/blog-posts/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      const local = staticPosts().find((p) => p.slug === slug);
      return local ?? null;
    }
    const data = (await res.json()) as BlogPost;
    return toCard(data);
  } catch {
    return staticPosts().find((p) => p.slug === slug) ?? null;
  }
}
