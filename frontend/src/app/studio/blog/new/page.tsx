"use client";

import { useRouter } from "next/navigation";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { useAuth } from "@/context/AuthContext";
import { api, type BlogPostInput } from "@/lib/api";

export default function StudioNewBlogPostPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  async function handleSubmit(data: BlogPostInput) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");
    await api.studio.blogPosts.create(token, data);
    router.push("/studio/blog");
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-stone-900">Nouvel article</h1>
      <p className="mt-2 text-stone-600">Publiez sur le blog de la galerie.</p>
      <div className="mt-10">
        <BlogPostForm submitLabel="Publier" onSubmit={handleSubmit} studio />
      </div>
    </div>
  );
}
