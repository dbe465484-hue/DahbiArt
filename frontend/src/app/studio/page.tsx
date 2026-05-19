"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function StudioHomePage() {
  const { user } = useAuth();

  return (
    <div>
      <AdminPageHeader
        title="Espace artiste"
        description={
          <>
            Bienvenue{user?.firstName ? `, ${user.firstName}` : ""} — publiez vos articles et
            événements.
          </>
        }
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/studio/blog"
          className="rounded-xl border border-stone-200/90 bg-white p-6 shadow-sm transition hover:border-amber-200 hover:shadow-md"
        >
          <p className="font-medium text-stone-900">Blog</p>
          <p className="mt-1 text-sm text-stone-500">Rédiger et publier des articles</p>
        </Link>
        <Link
          href="/studio/events"
          className="rounded-xl border border-stone-200/90 bg-white p-6 shadow-sm transition hover:border-amber-200 hover:shadow-md"
        >
          <p className="font-medium text-stone-900">Événements</p>
          <p className="mt-1 text-sm text-stone-500">Expositions et vernissages</p>
        </Link>
      </div>
    </div>
  );
}
