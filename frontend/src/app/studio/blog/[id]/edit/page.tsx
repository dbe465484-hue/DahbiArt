"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { useAuth } from "@/context/AuthContext";
import { api, type BlogPostInput, type BlogPostRecord } from "@/lib/api";

export default function StudioEditBlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getToken } = useAuth();
  const [post, setPost] = useState<BlogPostRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token || !id) return;
    api.studio.blogPosts
      .get(token, id)
      .then(setPost)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"));
  }, [getToken, id]);

  async function handleSubmit(data: BlogPostInput) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");
    await api.studio.blogPosts.update(token, id, data);
    router.push("/studio/blog");
  }

  if (error) return <p className="text-red-800">{error}</p>;
  if (!post) return <p className="text-stone-500">Chargement…</p>;

  return (
    <div>
      <h1 className="font-serif text-3xl text-stone-900">Modifier l&apos;article</h1>
      <div className="mt-10">
        <BlogPostForm initial={post} submitLabel="Enregistrer" onSubmit={handleSubmit} studio />
      </div>
    </div>
  );
}
