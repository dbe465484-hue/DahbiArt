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
    await api.admin.blogPosts.create(token, data);
    router.push("/admin/blog");
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
