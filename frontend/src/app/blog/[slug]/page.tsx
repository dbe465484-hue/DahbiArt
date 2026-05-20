import { notFound } from "next/navigation";
import { BlogPostPageContent } from "@/components/blog/BlogPostPageContent";
import fallback from "@/data/blog-fallback.json";
import { getBlogPost, getBlogPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return fallback.posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Article" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const all = await getBlogPosts();
  const related = all.filter((p) => p.slug !== slug).slice(0, 3);

  return <BlogPostPageContent post={post} related={related} />;
}
