"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const adminNav = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/paintings", label: "Peintures" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/events", label: "Événements" },
] as const;

type Props = {
  /** Sur le site public : masquer la nav admin détaillée, garder les accès site / admin */
  compact?: boolean;
};

export function AdminSidebar({ compact = false }: Props) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const onAdmin = pathname.startsWith("/admin") && pathname !== "/admin/login";

  return (
    <aside className="sticky top-0 z-30 flex h-screen w-60 shrink-0 self-start flex-col border-r border-stone-200 bg-stone-900 text-stone-200">
      <div className="border-b border-stone-700 px-5 py-6">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-400/90">Mayn</p>
        <p className="mt-1 font-serif text-lg text-white">Administration</p>
      </div>

      <div className="border-b border-stone-700 p-3">
        <Link
          href="/"
          className={`mb-1 block rounded px-3 py-2.5 text-sm transition ${
            !onAdmin ? "bg-amber-900/40 text-white" : "text-stone-300 hover:bg-stone-800 hover:text-white"
          }`}
        >
          Voir le site
        </Link>
        <Link
          href="/admin"
          className={`block rounded px-3 py-2.5 text-sm transition ${
            onAdmin ? "bg-amber-900/40 text-white" : "text-stone-300 hover:bg-stone-800 hover:text-white"
          }`}
        >
          Interface admin
        </Link>
      </div>

      {!compact && onAdmin && (
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          <p className="px-3 pb-1 text-[0.65rem] uppercase tracking-[0.18em] text-stone-500">
            Gestion
          </p>
          {adminNav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded px-3 py-2.5 text-sm transition ${
                  active ? "bg-amber-900/40 text-white" : "hover:bg-stone-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}

      {(!onAdmin || compact) && <div className="flex-1" />}

      <div className="mt-auto border-t border-stone-700 p-4 text-sm">
        <p className="truncate text-stone-400">{user?.email}</p>
        <button
          type="button"
          onClick={logout}
          className="mt-3 text-left text-stone-400 transition hover:text-white"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
