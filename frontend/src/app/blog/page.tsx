import { BlogPageContent } from "@/components/blog/BlogPageContent";
import { getBlogPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog",
  description:
    "Coulisses de l'atelier, techniques de peinture et carnets de voyage — le blog de Dahbi Machrouhi.",
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return <BlogPageContent posts={posts} />;
}
