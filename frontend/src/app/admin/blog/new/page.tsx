"use client";

import { useRouter } from "next/navigation";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { useAuth } from "@/context/AuthContext";
import { api, type BlogPostInput } from "@/lib/api";

export default function AdminNewBlogPostPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  async function handleSubmit(data: BlogPostInput) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");
    const created = await api.admin.blogPosts.create(token, data);
    if (created.published !== false) {
      router.push(`/blog/${created.slug}`);
      alert(`Article publié. Visible sur /blog/${created.slug}`);
    } else {
      router.push("/admin/blog");
      alert("Brouillon enregistré — cochez « Publié » pour l’afficher sur le blog.");
    }
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-stone-900">Nouvel article</h1>
      <p className="mt-2 text-stone-600">Publiez un article sur le blog.</p>
      <div className="mt-10">
        <BlogPostForm submitLabel="Créer l'article" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
