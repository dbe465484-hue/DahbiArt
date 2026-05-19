"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/paintings", label: "Peintures" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/events", label: "Événements" },
  { href: "/admin/users", label: "Utilisateurs" },
] as const;

export function AdminSubNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation admin"
      className="mb-8 flex flex-wrap gap-2 border-b border-stone-200/90 pb-4"
    >
      {links.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              active
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
